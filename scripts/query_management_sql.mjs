import { execFileSync } from "node:child_process";

const projectRef = "gfybyxbrmkwbzuyhyqiv";

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

const query = process.argv.slice(2).join(" ");
if (!query) {
  console.error("Usage: node scripts/query_management_sql.mjs '<sql>'");
  process.exit(1);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${readSupabaseToken()}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const text = await response.text();
if (!response.ok) {
  console.error(`HTTP ${response.status}: ${text}`);
  process.exit(1);
}
console.log(text);
