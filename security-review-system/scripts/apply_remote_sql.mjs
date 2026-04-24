import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const root = process.cwd();
const sqlFiles = [
  "supabase/rename_tables_to_sr.sql",
  "supabase/schema.sql",
  "supabase/seed_checklist.sql",
];

function redact(message) {
  return message.replace(/postgresql:\/\/[^@\s]+@/g, "postgresql://***@");
}

const poolerUrl = (await fs.readFile(path.join(root, "supabase/.temp/pooler-url"), "utf8")).trim();
const client = new pg.Client({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const file of sqlFiles) {
    const sql = await fs.readFile(path.join(root, file), "utf8");
    await client.query(sql);
    console.log(`applied ${file}`);
  }
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
