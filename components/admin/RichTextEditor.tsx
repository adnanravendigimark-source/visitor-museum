"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import RichImageModal, { ImageModalData } from "./RichImageModal";
import RichLinkModal from "./RichLinkModal";

function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return url;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Converts Markdown text (like ChatGPT copy output or standard markdown) into clean semantic HTML.
 */
function markdownToHtml(markdown: string, allowedHeadings: (1 | 2 | 3)[]): string {
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let inTable = false;
  let tableRows: string[] = [];

  function closeList() {
    if (inList) {
      htmlParts.push(`</${inList}>`);
      inList = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      htmlParts.push(`</blockquote>`);
      inBlockquote = false;
    }
  }

  function closeTable() {
    if (inTable && tableRows.length > 0) {
      const isHeader = (row: string) => /^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?\s*$/.test(row);
      const rowsHtml: string[] = [];
      let headerDone = false;

      for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        if (isHeader(row)) {
          headerDone = true;
          continue;
        }
        const cells = row
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => (idx === 0 && arr[0] === "" ? false : idx === arr.length - 1 && arr[arr.length - 1] === "" ? false : true));

        const tag = !headerDone && i === 0 ? "th" : "td";
        const rowContent = cells
          .map(
            (cell) =>
              `<${tag} style="border:1px solid #d6d3d1;padding:8px 12px;text-align:left;">${formatInlineMarkdown(
                cell
              )}</${tag}>`
          )
          .join("");
        rowsHtml.push(`<tr>${rowContent}</tr>`);
      }

      htmlParts.push(
        `<table style="border-collapse:collapse;width:100%;margin:1.5rem 0;"><tbody>${rowsHtml.join(
          ""
        )}</tbody></table>`
      );
      tableRows = [];
      inTable = false;
    }
  }

  function formatInlineMarkdown(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold + Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/___(.*?)___/g, "<strong><em>$1</em></strong>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Images: ![alt](url)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table row detection: "| cell | cell |"
    if (line.startsWith("|") && line.endsWith("|")) {
      closeList();
      closeBlockquote();
      inTable = true;
      tableRows.push(line);
      continue;
    } else {
      closeTable();
    }

    if (!line) {
      closeList();
      closeBlockquote();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const levelNum = headingMatch[1].length;
      let targetLevel: 1 | 2 | 3 = 2;
      if (levelNum === 1) targetLevel = allowedHeadings.includes(1) ? 1 : 2;
      else if (levelNum === 2) targetLevel = 2;
      else targetLevel = 3;

      htmlParts.push(`<h${targetLevel}>${formatInlineMarkdown(headingMatch[2])}</h${targetLevel}>`);
      continue;
    }

    // Blockquotes
    if (line.startsWith(">")) {
      closeList();
      const quoteText = line.replace(/^>\s*/, "");
      if (!inBlockquote) {
        htmlParts.push(`<blockquote>`);
        inBlockquote = true;
      }
      htmlParts.push(`<p>${formatInlineMarkdown(quoteText)}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list: - item, * item, + item
    const ulMatch = line.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (inList !== "ul") {
        closeList();
        htmlParts.push(`<ul>`);
        inList = "ul";
      }
      htmlParts.push(`<li>${formatInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list: 1. item
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inList !== "ol") {
        closeList();
        htmlParts.push(`<ol>`);
        inList = "ol";
      }
      htmlParts.push(`<li>${formatInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    // Regular paragraph
    htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  closeTable();

  return htmlParts.join("");
}

// Real pages / Word / Google Docs almost always carry proper HTML on the
// clipboard, but plain everyday article text very often ALSO happens to
// match our markdown heuristics below (a numbered intro like "1. Book
// tickets early", a stray "**word**", a "|" somewhere in a sentence). When
// that happens we must not throw the good HTML away — only fall back to
// the markdown/plain-text path when there's no real structure to keep.
function hasRichHtmlStructure(rawHtml: string): boolean {
  try {
    const doc = new DOMParser().parseFromString(rawHtml, "text/html");
    const body = doc.body;
    if (body.querySelector("h1, h2, h3, h4, h5, h6, table, ul, ol, blockquote")) return true;
    if (body.querySelectorAll("p").length > 1) return true;
    if (body.querySelector("strong, b, em, i, u, a")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Cleans and normalizes HTML pasted from rich sources (Google Docs, Word, ChatGPT web copy)
 * ensuring headings are mapped to allowed levels, stripping unwanted fonts/colors, while
 * preserving H2, H3, P, B, I, Lists, Links, Images, and Tables.
 */
function cleanRichHtml(rawHtml: string, allowedHeadings: (1 | 2 | 3)[]): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const body = doc.body;

    // Word and Google Docs frequently mark headings as styled <p> elements
    // instead of real <h1>-<h6> tags — e.g. Word's clipboard HTML uses
    // <p style="mso-style-name:'Heading 2'"> or <p class="MsoHeading2">.
    // Promote these to real heading tags first so the normalization pass
    // below (which only looks at actual h1-h6 tags) catches them too.
    const headingParas = body.querySelectorAll("p");
    headingParas.forEach((p) => {
      const signature = `${p.getAttribute("style") || ""} ${p.getAttribute("class") || ""}`;
      const match = signature.match(/heading\s*(\d)/i);
      if (!match) return;
      const level = Math.min(3, Math.max(1, parseInt(match[1], 10)));
      const tag = `h${level}`;
      const replacement = doc.createElement(tag);
      replacement.innerHTML = p.innerHTML;
      p.replaceWith(replacement);
    });

    // Normalize headings
    const headings = body.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((h) => {
      const tag = h.tagName.toLowerCase();
      let targetTag = "h2";
      if (tag === "h1") targetTag = allowedHeadings.includes(1) ? "h1" : "h2";
      else if (tag === "h2") targetTag = "h2";
      else targetTag = "h3";

      if (tag !== targetTag) {
        const replacement = doc.createElement(targetTag);
        replacement.innerHTML = h.innerHTML;
        h.replaceWith(replacement);
      }
    });

    // Strip inline font, background, and color styles that ruin dark/light themes
    const allElements = body.querySelectorAll("*");
    allElements.forEach((el) => {
      el.removeAttribute("class");
      if (el.hasAttribute("style")) {
        const style = el.getAttribute("style") || "";
        if (/border|collapse/i.test(style) && /TABLE|TD|TH|TR/i.test(el.tagName)) {
          el.setAttribute("style", "border:1px solid #d6d3d1;padding:8px 12px;");
        } else {
          el.removeAttribute("style");
        }
      }
    });

    // Ensure links have safe attributes
    const links = body.querySelectorAll("a");
    links.forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    return body.innerHTML;
  } catch {
    return rawHtml;
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "8rem",
  allowedHeadings = [1, 2, 3],
  stickyOffset,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  allowedHeadings?: (1 | 2 | 3)[];
  stickyOffset?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImageData, setEditingImageData] = useState<ImageModalData | null>(null);
  const editingImageElementRef = useRef<{
    img: HTMLImageElement;
    figure: HTMLElement | null;
    figcaption: HTMLElement | null;
  } | null>(null);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Real-time active format state for highlighting toolbar buttons (H2, H3, P, Bold, etc.)
  const [activeBlock, setActiveBlock] = useState<"h1" | "h2" | "h3" | "p" | "ul" | "ol" | "blockquote" | "table" | null>("p");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUl, setIsUl] = useState(false);
  const [isOl, setIsOl] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || "";
      setIsEmpty(!(value || "").trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    setIsEmpty(!ref.current.textContent?.trim());
    onChange(html);
    updateActiveFormats();
  }, [onChange]);

  // Inspects the user's cursor / selection to determine active format
  const updateActiveFormats = useCallback(() => {
    if (!ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

    let detectedBlock: "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "blockquote" | "table" | null = null;
    let curr = node as HTMLElement | null;
    while (curr && curr !== ref.current) {
      const tag = curr.tagName.toLowerCase();
      if (tag === "h1") { detectedBlock = "h1"; break; }
      if (tag === "h2") { detectedBlock = "h2"; break; }
      if (tag === "h3") { detectedBlock = "h3"; break; }
      if (tag === "p") { detectedBlock = "p"; break; }
      if (tag === "ul") { detectedBlock = "ul"; break; }
      if (tag === "ol") { detectedBlock = "ol"; break; }
      if (tag === "blockquote") { detectedBlock = "blockquote"; break; }
      if (tag === "table") { detectedBlock = "table"; break; }
      curr = curr.parentElement;
    }

    setActiveBlock(detectedBlock || "p");

    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsUl(document.queryCommandState("insertUnorderedList"));
      setIsOl(document.queryCommandState("insertOrderedList"));
    } catch {}
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateActiveFormats]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  }

  function captureSelection(): Range | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current) return null;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return null;
    return range.cloneRange();
  }

  function restoreSelection(): Range | null {
    if (!ref.current) return null;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel) return null;
    sel.removeAllRanges();
    let range: Range;
    if (savedRangeRef.current) {
      range = savedRangeRef.current;
    } else {
      range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
    }
    sel.addRange(range);
    return range;
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedHtml = clipboardData.getData("text/html");
    const pastedText = clipboardData.getData("text/plain");

    let finalHtml = "";

    // Real HTML (a genuine h1/h2/table/list/etc. structure) always wins —
    // ordinary article text very often ALSO happens to match the markdown
    // patterns below (a numbered intro like "1. Book tickets early", a
    // stray "**word**", a "|" in a sentence), so checking markdown-ness
    // first used to throw away perfectly good pasted HTML from real blogs,
    // Word, and Google Docs and re-derive a flattened version from the
    // crude plain text instead — which is where headings and tables were
    // getting lost. Only fall back to the markdown/plain-text path when
    // there's no real HTML structure to keep.
    const hasRichHtml = !!pastedHtml && hasRichHtmlStructure(pastedHtml);

    // Check if plain text looks like markdown (e.g. ## Heading, **bold**, - list)
    const isMarkdown =
      pastedText &&
      (/(^|\n)#{1,6}\s+/.test(pastedText) ||
        /(^|\n)[-*+]\s+/.test(pastedText) ||
        /(^|\n)\d+\.\s+/.test(pastedText) ||
        /\*\*[^*]+\*\*/.test(pastedText) ||
        /\[[^\]]+\]\([^)]+\)/.test(pastedText) ||
        /(^|\n)\|.*\|/.test(pastedText));

    if (hasRichHtml) {
      // Clean HTML from web pages, Word, Google Docs, or rich text editors
      finalHtml = cleanRichHtml(pastedHtml, allowedHeadings);
    } else if (pastedText) {
      if (isMarkdown) {
        finalHtml = markdownToHtml(pastedText, allowedHeadings);
      } else if (pastedHtml) {
        // HTML exists but has no real structure (e.g. a flat styled span) —
        // still better to clean it than to discard it.
        finalHtml = cleanRichHtml(pastedHtml, allowedHeadings);
      } else {
        // Plain text with multiple paragraphs
        const paras = pastedText.split(/\r?\n\r?\n/);
        finalHtml = paras
          .map((p) => {
            const clean = p.trim().replace(/\r?\n/g, "<br>");
            return clean ? `<p>${clean}</p>` : "";
          })
          .filter(Boolean)
          .join("");
      }
    }

    if (finalHtml) {
      ref.current?.focus();
      document.execCommand("insertHTML", false, finalHtml);
      handleInput();
    }
  }

  function handleEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    updateActiveFormats();

    const target = e.target as HTMLElement;
    let img: HTMLImageElement | null = null;
    let figure: HTMLElement | null = null;

    if (target.tagName === "IMG") {
      img = target as HTMLImageElement;
      figure = img.closest("figure");
    } else if (target.tagName === "FIGURE" || target.closest("figure")) {
      figure = target.tagName === "FIGURE" ? target : target.closest("figure");
      img = figure ? figure.querySelector("img") : null;
    }

    if (img) {
      e.preventDefault();
      const figcaption = figure ? figure.querySelector("figcaption") : null;
      editingImageElementRef.current = { img, figure, figcaption };
      setEditingImageData({
        url: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
        caption: figcaption?.textContent || "",
      });
      setImageModalOpen(true);
    }
  }

  function insertLink() {
    savedRangeRef.current = captureSelection();
    setLinkModalOpen(true);
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
    const range = restoreSelection();
    if (!range) {
      setLinkModalOpen(false);
      return;
    }
    const normalized = normalizeUrl(url);

    const anchor = document.createElement("a");
    anchor.setAttribute("href", normalized);
    if (newTab) anchor.setAttribute("target", "_blank");
    const relTokens = [
      ...(nofollow ? ["nofollow"] : []),
      ...(newTab ? ["noopener", "noreferrer"] : []),
    ];
    if (relTokens.length) anchor.setAttribute("rel", relTokens.join(" "));

    if (range.collapsed) {
      anchor.textContent = normalized;
    } else {
      anchor.appendChild(range.extractContents());
    }
    range.insertNode(anchor);

    range.setStartAfter(anchor);
    range.collapse(true);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    handleInput();
    setLinkModalOpen(false);
  }

  function applyHeading(level: 1 | 2 | 3) {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;

    if (!range || range.collapsed || !ref.current || !ref.current.contains(range.commonAncestorContainer)) {
      exec("formatBlock", `<h${level}>`);
      return;
    }

    const startedInTextNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE;
    let block: HTMLElement | null = startedInTextNode
      ? range.commonAncestorContainer.parentElement
      : (range.commonAncestorContainer as HTMLElement);
    while (block && block !== ref.current && !/^(P|H1|H2|H3|H4|H5|H6|LI)$/.test(block.tagName)) {
      block = block.parentElement;
    }

    const useRootAsBlock = (!block || block === ref.current) && startedInTextNode;
    if ((!block || block === ref.current) && !useRootAsBlock) {
      exec("formatBlock", `<h${level}>`);
      return;
    }
    const container: HTMLElement = useRootAsBlock ? ref.current : (block as HTMLElement);

    ref.current.focus();

    const beforeRange = document.createRange();
    beforeRange.setStart(container, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    const afterRange = document.createRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    afterRange.setEnd(container, container.childNodes.length);

    const beforeFrag = beforeRange.cloneContents();
    const selectedFrag = range.cloneContents();
    const afterFrag = afterRange.cloneContents();

    const replacement: HTMLElement[] = [];
    if (beforeFrag.textContent?.trim()) {
      const p = document.createElement("p");
      p.appendChild(beforeFrag);
      replacement.push(p);
    }
    const heading = document.createElement(`h${level}`);
    heading.appendChild(selectedFrag);
    replacement.push(heading);
    if (afterFrag.textContent?.trim()) {
      const p = document.createElement("p");
      p.appendChild(afterFrag);
      replacement.push(p);
    }

    if (useRootAsBlock) {
      container.replaceChildren(...replacement);
    } else {
      container.replaceWith(...replacement);
    }

    const newSel = window.getSelection();
    if (newSel) {
      const after = document.createRange();
      after.selectNodeContents(heading);
      after.collapse(false);
      newSel.removeAllRanges();
      newSel.addRange(after);
    }

    handleInput();
  }

  function openNewImageModal() {
    editingImageElementRef.current = null;
    setEditingImageData(null);
    savedRangeRef.current = captureSelection();
    setImageModalOpen(true);
  }

  function handleImageModalSave({ url, alt, caption }: ImageModalData) {
    if (editingImageElementRef.current) {
      const { img, figure } = editingImageElementRef.current;
      img.setAttribute("src", url);
      img.setAttribute("alt", alt);

      const trimmedCaption = caption.trim();
      if (trimmedCaption) {
        if (figure) {
          let figcaption = figure.querySelector("figcaption");
          if (!figcaption) {
            figcaption = document.createElement("figcaption");
            figure.appendChild(figcaption);
          }
          figcaption.textContent = trimmedCaption;
        } else {
          const fig = document.createElement("figure");
          const cap = document.createElement("figcaption");
          cap.textContent = trimmedCaption;
          img.replaceWith(fig);
          fig.appendChild(img);
          fig.appendChild(cap);
        }
      } else if (figure) {
        const figcaption = figure.querySelector("figcaption");
        if (figcaption) figcaption.remove();
      }

      handleInput();
      editingImageElementRef.current = null;
      setEditingImageData(null);
      setImageModalOpen(false);
      return;
    }

    if (!restoreSelection()) {
      setImageModalOpen(false);
      return;
    }
    const safeAlt = alt.replace(/"/g, "&quot;");
    const safeUrl = url.replace(/"/g, "&quot;");
    const imgHtml = `<img src="${safeUrl}" alt="${safeAlt}" />`;
    const trimmedCaption = caption.trim();
    const html = trimmedCaption
      ? `<figure>${imgHtml}<figcaption>${escapeHtml(trimmedCaption)}</figcaption></figure><p><br></p>`
      : `${imgHtml}<p><br></p>`;
    document.execCommand("insertHTML", false, html);
    handleInput();
    setImageModalOpen(false);
  }

  function handleImageDelete() {
    if (editingImageElementRef.current) {
      const { img, figure } = editingImageElementRef.current;
      const toRemove = figure || img;
      toRemove.remove();
      handleInput();
      editingImageElementRef.current = null;
      setEditingImageData(null);
      setImageModalOpen(false);
    }
  }

  function insertTable() {
    ref.current?.focus();
    const rows = 3;
    const cols = 3;
    const cells = Array.from({ length: cols })
      .map(() => `<td style="border:1px solid #d6d3d1;padding:6px 10px;">&nbsp;</td>`)
      .join("");
    const tableRows = Array.from({ length: rows }).map(() => `<tr>${cells}</tr>`).join("");
    document.execCommand(
      "insertHTML",
      false,
      `<table style="border-collapse:collapse;width:100%;margin:1.5rem 0;"><tbody>${tableRows}</tbody></table><p><br></p>`
    );
    handleInput();
  }

  const ToolbarButton = ({
    label,
    title,
    active = false,
    onClick,
  }: {
    label: React.ReactNode;
    title: string;
    active?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? "bg-canal-blue text-white shadow-sm ring-1 ring-canal-blue"
          : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
      }`}
    >
      {label}
    </button>
  );

  const getFormatLabel = () => {
    switch (activeBlock) {
      case "h1":
        return "Heading 1 (H1)";
      case "h2":
        return "Heading 2 (H2)";
      case "h3":
        return "Heading 3 (H3)";
      case "ul":
        return "Bullet List";
      case "ol":
        return "Numbered List";
      case "blockquote":
        return "Quote";
      case "table":
        return "Table";
      case "p":
      default:
        return "Paragraph (P)";
    }
  };

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
              active={activeBlock === "h1"}
              onClick={() => applyHeading(1)}
            />
          )}
          {allowedHeadings.includes(2) && (
            <ToolbarButton
              label="H2"
              title="Heading 2"
              active={activeBlock === "h2"}
              onClick={() => applyHeading(2)}
            />
          )}
          {allowedHeadings.includes(3) && (
            <ToolbarButton
              label="H3"
              title="Heading 3"
              active={activeBlock === "h3"}
              onClick={() => applyHeading(3)}
            />
          )}
          <ToolbarButton
            label="P"
            title="Paragraph (normal text)"
            active={activeBlock === "p"}
            onClick={() => exec("formatBlock", "<p>")}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton
            label={<span className="font-bold">B</span>}
            title="Bold"
            active={isBold}
            onClick={() => exec("bold")}
          />
          <ToolbarButton
            label={<span className="italic">I</span>}
            title="Italic"
            active={isItalic}
            onClick={() => exec("italic")}
          />
          <ToolbarButton
            label={<span className="underline">U</span>}
            title="Underline"
            active={isUnderline}
            onClick={() => exec("underline")}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton
            label="• List"
            title="Bullet list"
            active={isUl || activeBlock === "ul"}
            onClick={() => exec("insertUnorderedList")}
          />
          <ToolbarButton
            label="1. List"
            title="Numbered list"
            active={isOl || activeBlock === "ol"}
            onClick={() => exec("insertOrderedList")}
          />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton label="Link" title="Insert link" onClick={insertLink} />
          <ToolbarButton label="Image" title="Insert image" onClick={openNewImageModal} />
          <ToolbarButton label="Table" title="Insert 3×3 table" onClick={insertTable} />
          <span className="mx-1 h-4 w-px bg-stone-300" />
          <ToolbarButton label="Clear" title="Clear formatting" onClick={() => exec("removeFormat")} />
        </div>

        {/* Real-time Block Status Indicator Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-stone-500">
          <span className="h-2 w-2 rounded-full bg-canal-blue" />
          <span>Current:</span>
          <span className="font-semibold text-stone-800">{getFormatLabel()}</span>
        </div>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onClick={handleEditorClick}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        data-rte-empty={isEmpty ? "true" : "false"}
        className="rich-content max-w-none px-3 py-2.5 text-sm text-stone-900 outline-none [&_img]:cursor-pointer [&_img]:transition [&_img:hover]:ring-4 [&_img:hover]:ring-canal-blue/40 [&_img:hover]:rounded-lg [&_figure]:cursor-pointer [&_figure:hover]:opacity-95"
        style={{ minHeight }}
      />

      {imageModalOpen && (
        <RichImageModal
          initialValues={editingImageData || undefined}
          isEditing={!!editingImageData}
          onInsert={handleImageModalSave}
          onDelete={editingImageData ? handleImageDelete : undefined}
          onClose={() => {
            setImageModalOpen(false);
            setEditingImageData(null);
            editingImageElementRef.current = null;
          }}
        />
      )}
      {linkModalOpen && (
        <RichLinkModal onInsert={handleLinkInsert} onClose={() => setLinkModalOpen(false)} />
      )}
    </div>
  );
}
