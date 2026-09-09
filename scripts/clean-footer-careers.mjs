import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

async function main() {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql`SELECT footer_json FROM homepage WHERE id = 1 LIMIT 1`;
  if (rows.length) {
    const footer = rows[0].footer_json || {};
    if (footer.columns && Array.isArray(footer.columns)) {
      footer.columns.forEach((col) => {
        if (col.links && Array.isArray(col.links)) {
          col.links = col.links.filter((l) => !/careers/i.test(l.label));
        }
      });
      await sql`
        UPDATE homepage SET footer_json = ${JSON.stringify(footer)}::jsonb WHERE id = 1
      `;
      console.log("Cleaned Careers from database footer_json!");
    }
  }
}

main().catch(console.error);
