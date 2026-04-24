import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRef = "gfybyxbrmkwbzuyhyqiv";
const root = process.cwd();
const sqlFiles = [
  "supabase/rename_tables_to_sr.sql",
  "supabase/schema.sql",
  "supabase/seed_checklist.sql",
];

function readSupabaseToken() {
  const raw = execFileSync("security", [
    "find-generic-password",
    "-a",
    "supabase",
    "-s",
    "Supabase CLI",
    "-w",
  ], { encoding: "utf8" }).trim();

  if (raw.startsWith("go-keyring-base64:")) {
    return Buffer.from(raw.slice("go-keyring-base64:".length), "base64").toString("utf8").trim();
  }
  return raw;
}

async function runQuery(token, file) {
  const query = await fs.readFile(path.join(root, file), "utf8");
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${file} failed with HTTP ${response.status}: ${text}`);
  }
  console.log(`applied ${file}`);
}

const token = readSupabaseToken();
for (const file of sqlFiles) {
  await runQuery(token, file);
}
