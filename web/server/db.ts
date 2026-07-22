import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { seed } from "./seed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgres://shop:shop@localhost:5432/shop",
});

async function waitForDb(): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      if (attempt >= 30) throw err;
      console.log(`[db] PostgreSQL indisponible, nouvel essai (${attempt}/30)…`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

export async function initDb(): Promise<void> {
  await waitForDb();
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);

  const { rows } = await pool.query("SELECT count(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    await seed(pool);
    console.log("[db] Base initialisée : 15 fleurs et 3 comptes de démonstration");
  }
}
