import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function reset() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS campaign_recipients CASCADE;
      DROP TABLE IF EXISTS recipients CASCADE;
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
      DROP TYPE IF EXISTS campaign_status CASCADE;
      DROP TYPE IF EXISTS cr_status CASCADE;
    `);
    console.log("reset complete — all tables dropped");
  } finally {
    client.release();
    await pool.end();
  }
}

reset().catch((err) => {
  console.error("reset failed:", err);
  process.exit(1);
});
