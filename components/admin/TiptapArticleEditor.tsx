"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HeadingExtension, { type Level } from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Node, mergeAttributes } from "@tiptap/core";
import { DOMParser as PMDOMParser, Slice } from "@tiptap/pm/model";
import RichImageModal, { ImageModalData } from "./RichImageModal";
import RichLinkModal from "./RichLinkModal";

// Tiptap-based rich text editor, used ONLY for the blog post "Article
// Content" field (see PostForm.tsx) — everywhere else in the admin
// (tour descriptions, FAQ answers, homepage sections, About/Contact/
// Privacy body text) keeps using the original hand-rolled RichTextEditor,
// unchanged. Tiptap (built on ProseMirror) gives real, battle-tested HTML
// paste handling — headings, tables, and lists from an external site,
// Word, or Google Docs come through correctly without the custom
// paste-cleaning heuristics the old editor needed.

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Minimal inline markdown -> HTML for text pasted as plain text (no
// clipboard HTML at all — e.g. copied from a chat message, a .md file, or
// a plain text editor): `code`, **bold**/__bold__, *italic*/_italic_.
function inlineMarkdownToHtml(raw: string): string {
  let s = escapeHtml(raw);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/(^|[^\w])_([^_]+)_(?!\w)/g, "$1<em>$2</em>");
  return s;
}

function parseMarkdownTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isMarkdownTableSeparatorRow(line: string): boolean {
  const cells = parseMarkdownTableRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c));
}

// Converts plain-text markdown (tables, headings, bullet/numbered lists,
// paragraphs) into real HTML block markup. Used only when the clipboard
// has no real HTML table/heading/list for ProseMirror to parse directly —
// e.g. a markdown table like "| Season | Item |" pasted as plain text
// would otherwise land as one literal line of "|" characters instead of
// becoming a real table. Returns null if nothing markdown-like was found,
// so ordinary plain-text paste (a sentence, a URL, etc.) is left alone.
function markdownToHtml(text: string): string | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let html = "";
  let matchedAnything = false;
  let paraBuf: string[] = [];

  const flushParagraph = () => {
    const t = paraBuf.join(" ").trim();
    if (t) html += `<p>${inlineMarkdownToHtml(t)}</p>`;
    paraBuf = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && isMarkdownTableSeparatorRow(lines[i + 1])) {
      flushParagraph();
      matchedAnything = true;
      const header = parseMarkdownTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(parseMarkdownTableRow(lines[i]));
        i++;
      }
      html +=
        "<table><tbody><tr>" +
        header.map((c) => `<th>${inlineMarkdownToHtml(c)}</th>`).join("") +
        "</tr>" +
        rows.map((r) => "<tr>" + r.map((c) => `<td>${inlineMarkdownToHtml(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>";
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      matchedAnything = true;
      const level = Math.min(3, headingMatch[1].length);
      html += `<h${level}>${inlineMarkdownToHtml(headingMatch[2].trim())}</h${level}>`;
      i++;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      matchedAnything = true;
      html += "<ul>";
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        html += `<li>${inlineMarkdownToHtml(lines[i].replace(/^\s*[-*+]\s+/, "").trim())}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushParagraph();
      matchedAnything = true;
      html += "<ol>";
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        html += `<li>${inlineMarkdownToHtml(lines[i].replace(/^\s*\d+[.)]\s+/, "").trim())}</li>`;
        i++;
      }
      html += "</ol>";
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      i++;
      continue;
    }

    paraBuf.push(line.trim());
    i++;
  }
  flushParagraph();

  return matchedAnything ? html : null;
}

function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return url;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}

// --- Heading: restrict to the allowed levels for this field, and map any
// out-of-schema pasted heading down to a sensible in-schema level instead
// of losing it — mirrors the old editor's behavior exactly (an H1 becomes
// H2 when H1 isn't allowed, since the post's own title already IS the
// page's H1; H4-H6 become H3, the smallest heading the site styles). ---
const Heading = HeadingExtension.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3] as Level[],
    };
  },
  parseHTML() {
    const allowed = (this.options.levels as number[]) || [1, 2, 3];
    return [1, 2, 3, 4, 5, 6].map((tagLevel) => {
      let level: number;
      if (tagLevel === 1) level = allowed.includes(1) ? 1 : 2;
      else if (tagLevel === 2) level = 2;
      else level = 3;
      return { tag: `h${tagLevel}`, attrs: { level } };
    });
  },
});

// --- Link: add "target" and "rel" as real per-link attributes (not just a
// site-wide default) so the "No follow" / "Open in new tab" choices in
// RichLinkModal apply per link, matching the old editor's link modal. ---
const LinkWithAttrs = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("target"),
        renderHTML: (attrs: Record<string, any>) => (attrs.target ? { target: attrs.target } : {}),
      },
      rel: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("rel"),
        renderHTML: (attrs: Record<string, any>) => (attrs.rel ? { rel: attrs.rel } : {}),
      },
    };
  },
});

// --- Figure: a captioned image (<figure><img/><figcaption>...</figcaption></figure>),
// matching the exact markup the old editor produced and that
// globals.css's .rich-content figure/figcaption rules already style.
// A plain, uncaptioned image still just uses the standard Image extension. ---
const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  isolating: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
        getAttrs: (el: HTMLElement | string) => {
          if (typeof el === "string") return false;
          const img = el.querySelector("img");
          if (!img) return false;
          return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
        },
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes),
      ["img", { src: node.attrs.src, alt: node.attrs.alt || "" }],
      ["figcaption", 0],
    ];
  },
});

const ToolbarButton = ({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`rounded px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "bg-canal-blue text-white shadow-sm ring-1 ring-canal-blue"
        : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
    }`}
  >
    {label}
  </button>
);

export default function TiptapArticleEditor({
  value,
  onChange,
  placeholder,
  minHeight = "8rem",
  allowedHeadings = [2, 3],
  stickyOffset,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  allowedHeadings?: (1 | 2 | 3)[];
  stickyOffset?: string;
}) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImageData, setEditingImageData] = useState<ImageModalData | null>(null);
  const editingImageRef = useRef<{ pos: number } | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const editor = useEditor({
    // Avoids a Tiptap/Next.js SSR hydration mismatch — the editor should
    // only render its content after the client mounts.
    immediatelyRender: false,
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "tiptap rich-content max-w-none px-3 py-2.5 text-sm text-stone-900 outline-none [&_img]:cursor-pointer [&_figure]:cursor-pointer",
      },
      // ProseMirror passes two positions here: `pos` (nearest position to
      // the click) and `nodePos` (the node's actual start position). For
      // atomic nodes like image/figure these can differ — using `pos`
      // instead of `nodePos` meant tr.doc.nodeAt(pos) in replaceNodeAt/
      // handleImageDelete below would often resolve to null, silently
      // no-oping "Save changes" and "Remove from Article" alike instead of
      // throwing, so it looked like the buttons just didn't work.
      handleClickOn: (_view: any, _pos: number, node: any, nodePos: number) => {
        if (node.type.name === "image") {
          editingImageRef.current = { pos: nodePos };
          setEditingImageData({ url: node.attrs.src || "", alt: node.attrs.alt || "", caption: "" });
          setImageModalOpen(true);
          return true;
        }
        if (node.type.name === "figure") {
          editingImageRef.current = { pos: nodePos };
          setEditingImageData({
            url: node.attrs.src || "",
            alt: node.attrs.alt || "",
            caption: node.textContent || "",
          });
          setImageModalOpen(true);
          return true;
        }
        return false;
      },
      // Word (and some Google Docs exports) don't paste real <h1>-<h6> or
      // <ul>/<ol><li> markup: headings come through as <p style="mso-style-
      // name:Heading2">, and list items come through as flat
      // <p style="mso-list:l0 level1 ..."> paragraphs with a literal "1."
      // or "•" character typed into the text, not a real ordered/unordered
      // list. ProseMirror's default paste parsing only recognizes real
      // <h*>/<ul>/<ol>/<li> tags, so pasted Word content silently lost all
      // heading/list structure and came in as a wall of plain paragraphs.
      // This normalizes that Word markup into real semantic HTML before
      // ProseMirror parses the paste, so it maps onto this editor's
      // Heading/BulletList/OrderedList nodes correctly. Tables already
      // paste correctly as-is — Word's table markup is standard <table>/
      // <tr>/<td>.
      transformPastedHTML(html: string) {
        if (!/mso-list\s*:|mso-style-name\s*:/i.test(html)) return html;
        try {
          const doc = new DOMParser().parseFromString(html, "text/html");

          // Headings shipped as styled paragraphs -> real <h1>-<h6>.
          doc.body.querySelectorAll("p").forEach((p) => {
            const style = p.getAttribute("style") || "";
            const m = /mso-style-name\s*:\s*["']?Heading\s*([1-6])["']?/i.exec(style);
            if (!m) return;
            const h = doc.createElement(`h${m[1]}`);
            h.innerHTML = p.innerHTML;
            p.replaceWith(h);
          });

          // Runs of Word's fake-list paragraphs -> real <ul>/<ol><li>.
          const isListPara = (p: Element) => /mso-list\s*:/i.test(p.getAttribute("style") || "");
          const listParas = Array.from(doc.body.querySelectorAll("p")).filter(isListPara);
          const markerRe = /^(\s|&nbsp;| )*([0-9]+[.)]|[a-zA-Z][.)]|[••●▪·o\-])(\s|&nbsp;| )*/;

          let i = 0;
          while (i < listParas.length) {
            const run = [listParas[i]];
            let j = i + 1;
            while (j < listParas.length && listParas[j].previousElementSibling === listParas[j - 1]) {
              run.push(listParas[j]);
              j++;
            }
            const firstText = run[0].textContent || "";
            const marker = markerRe.exec(firstText);
            const ordered = !!marker && /^[0-9]+[.)]$/.test(marker[2]);
            const list = doc.createElement(ordered ? "ol" : "ul");
            for (const p of run) {
              const li = doc.createElement("li");
              const clone = p.cloneNode(true) as HTMLElement;
              clone.querySelectorAll('span[style*="mso-list"]').forEach((s) => s.remove());
              li.innerHTML = clone.innerHTML.replace(markerRe, "");
              list.appendChild(li);
            }
            run[0].replaceWith(list);
            for (let k = 1; k < run.length; k++) run[k].remove();
            i = j;
          }

          return doc.body.innerHTML;
        } catch {
          return html;
        }
      },
      // transformPastedHTML above returns an HTML *string* — ProseMirror
      // still does its own default parsing of that string into a Slice,
      // inferring open start/end boundaries the normal way. For a lone
      // block like a single converted <h2> (no sibling paragraph in the
      // pasted fragment), that inference can leave the slice "open",
      // which merges the heading straight into whatever paragraph text
      // follows the cursor instead of inserting it as its own block — the
      // same class of bug handlePaste's Slice(..., 0, 0) fixes below, but
      // for HTML paste rather than plain-text markdown paste. This forces
      // closed boundaries specifically when the pasted content's outer
      // nodes are block types that should never silently absorb
      // surrounding text (heading/list/table); ordinary paragraph or
      // inline pastes are left alone since merging into the surrounding
      // paragraph is the correct, expected behavior there.
      transformPasted(slice: any) {
        const neverMerge = new Set(["heading", "bulletList", "orderedList", "table"]);
        const first = slice.content.firstChild;
        const last = slice.content.lastChild;
        if (first && last && neverMerge.has(first.type.name) && neverMerge.has(last.type.name)) {
          return new Slice(slice.content, 0, 0);
        }
        return slice;
      },
      // Plain-text markdown paste (no HTML on the clipboard at all — e.g.
      // copied from a chat message, a .md file, or a plain text editor):
      // a markdown table like "| Season | Item |" / "|---|---|" has no
      // <table> for ProseMirror to parse, so by default it lands as
      // literal "|" characters in a paragraph instead of becoming a real
      // table (same for "# Heading" and "- list" lines). Only intervenes
      // when there's no real HTML table already on the clipboard and the
      // plain text actually parses as markdown — ordinary text paste
      // (a sentence, a URL, prose with a stray "-") is left untouched.
      handlePaste(view: any, event: ClipboardEvent) {
        const cd = event.clipboardData;
        if (!cd) return false;
        const html = cd.getData("text/html");
        if (html && /<table[\s>]/i.test(html)) return false;
        const text = cd.getData("text/plain");
        if (!text || !text.trim()) return false;
        const generated = markdownToHtml(text);
        if (!generated) return false;

        const el = document.createElement("div");
        el.innerHTML = generated;
        // parseSlice() infers open start/end boundaries from the parsed
        // content, which for block content (a table, a heading) can merge
        // it into whatever paragraph happens to follow the cursor instead
        // of inserting it as its own clean block — e.g. pasting a table in
        // the middle of an article could silently absorb the next
        // paragraph's text into the table's last cell. Building a fully
        // closed Slice (openStart/openEnd = 0) from parse() instead
        // guarantees the generated blocks are inserted intact, with no
        // merging into surrounding content.
        const parsedNode = PMDOMParser.fromSchema(view.state.schema).parse(el);
        const slice = new Slice(parsedNode.content, 0, 0);
        view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
        return true;
      },
    },
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: allowedHeadings.length ? allowedHeadings : [2, 3] }),
      Underline,
      LinkWithAttrs.configure({ openOnClick: false, autolink: false }),
      Image,
      Figure,
      Placeholder.configure({ placeholder: placeholder || "Write here…" }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Forces every toolbar/status re-render on selection changes too (not
  // just content changes), so the H2/H3/Bold/etc. active-state highlighting
  // stays accurate as the cursor moves — mirrors the old editor's
  // selectionchange listener.
  const [, forceRerender] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceRerender((n) => n + 1);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const replaceNodeAt = useCallback(
    (ed: Editor, pos: number, content: Record<string, any>) => {
      ed.chain()
        .focus()
        .command(({ tr }: { tr: any }) => {
          const current = tr.doc.nodeAt(pos);
          if (!current) return false;
          tr.delete(pos, pos + current.nodeSize);
          return true;
        })
        .run();
      ed.chain().focus().insertContentAt(pos, content).run();
    },
    []
  );

  function openNewImageModal() {
    editingImageRef.current = null;
    setEditingImageData(null);
    setImageModalOpen(true);
  }

  function handleImageModalSave(opts: ImageModalData) {
    if (!editor) return;
    const caption = opts.caption.trim();
    const content = caption
      ? {
          type: "figure",
          attrs: { src: opts.url, alt: opts.alt || "" },
          content: [{ type: "text", text: caption }],
        }
      : { type: "image", attrs: { src: opts.url, alt: opts.alt || "" } };

    if (editingImageRef.current) {
      replaceNodeAt(editor, editingImageRef.current.pos, content);
    } else {
      editor.chain().focus().insertContent(content).run();
    }
    setImageModalOpen(false);
    setEditingImageData(null);
    editingImageRef.current = null;
  }

  function handleImageDelete() {
    if (!editor || !editingImageRef.current) return;
    const pos = editingImageRef.current.pos;
    editor
      .chain()
      .focus()
      .command(({ tr }: { tr: any }) => {
        const node = tr.doc.nodeAt(pos);
        if (!node) return false;
        tr.delete(pos, pos + node.nodeSize);
        return true;
      })
      .run();
    setImageModalOpen(false);
    setEditingImageData(null);
    editingImageRef.current = null;
  }

  function handleLinkInsert({
    url,
    nofollow,
    newTab,
  }: {
    url: string;
    nofollow: boolean;
    newTab: boolean;
  }) {
    if (!editor) return;
    const normalized = normalizeUrl(url);
    const attrs: { href: string; target: string | null; rel: string | null } = {
      href: normalized,
      target: null,
      rel: null,
    };
    if (newTab) {
      attrs.target = "_blank";
      attrs.rel = nofollow ? "nofollow noopener noreferrer" : "noopener noreferrer";
    } else if (nofollow) {
      attrs.rel = "nofollow";
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: normalized, marks: [{ type: "link", attrs }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    setLinkModalOpen(false);
  }

  const getFormatLabel = () => {
    if (!editor) return "Paragraph (P)";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1 (H1)";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2 (H2)";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3 (H3)";
    if (editor.isActive("bulletList")) return "Bullet List";
    if (editor.isActive("orderedList")) return "Numbered List";
    if (editor.isActive("blockquote")) return "Quote";
    if (editor.isActive("table")) return "Table";
    return "Paragraph (P)";
  };

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-400"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  const inTable = editor.isActive("table");

  return (
    <div className="rounded-lg border border-stone-300 focus-within:border-canal-blue focus-within:ring-1 focus-within:ring-canal-blue">
      <div
        className="sticky z-10 flex flex-wrap items-center justify-between gap-1 rounded-t-lg border-b border-stone-200 bg-stone-50 p-1.5"
        style={{ top: stickyOffset || 0 }}
      >
        <div className="flex flex-wrap items-center gap-0.5">
          {allowedHeadings.includes(1) && (
            <ToolbarButton
              label="H1"
              title="Heading 1"
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
          )}
          {allowedHeadings.includes(2) && (
            <ToolbarButton
              label="H2"
              title="Heading 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
          )}
          {allowedHeadings.includes(3) && (
            <ToolbarButton
              label="H3"
              title="Heading 3"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
          )}
          <ToolbarButton
            label="P"
            title="Paragraph (normal text)"
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton
            label={<span className="font-bold">B</span>}
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label={<span className="italic">I</span>}
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label={<span className="underline">U</span>}
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton
            label="• List"
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="1. List"
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton label="Link" title="Insert link" onClick={() => setLinkModalOpen(true)} />
          <ToolbarButton label="Image" title="Insert image" onClick={openNewImageModal} />
          <ToolbarButton
            label="Table"
            title="Insert 3×3 table"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          />
          {inTable && (
            <>
              <span className="mx-1 h-4 w-px bg-stone-300" />
              <ToolbarButton label="+Row" title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()} />
              <ToolbarButton label="+Col" title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()} />
              <ToolbarButton label="-Row" title="Delete current row" onClick={() => editor.chain().focus().deleteRow().run()} />
              <ToolbarButton label="-Col" title="Delete current column" onClick={() => editor.chain().focus().deleteColumn().run()} />
              <ToolbarButton label="Del Table" title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} />
            </>
          )}
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton
            label="Clear"
            title="Clear formatting"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          />
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-stone-500">
          <span className="h-2 w-2 rounded-full bg-canal-blue" />
          <span>Current:</span>
          <span className="font-semibold text-stone-800">{getFormatLabel()}</span>
        </div>
      </div>

      <EditorContent editor={editor} style={{ minHeight }} />

      {imageModalOpen && (
        <RichImageModal
          initialValues={editingImageData || undefined}
          isEditing={!!editingImageData}
          onInsert={handleImageModalSave}
          onDelete={editingImageData ? handleImageDelete : undefined}
          onClose={() => {
            setImageModalOpen(false);
            setEditingImageData(null);
            editingImageRef.current = null;
          }}
        />
      )}
      {linkModalOpen && (
        <RichLinkModal onInsert={handleLinkInsert} onClose={() => setLinkModalOpen(false)} />
      )}
    </div>
  );
}
