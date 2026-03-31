import { neon } from "@neondatabase/serverless";

const url = "postgresql://neondb_owner:npg_a7KAgzvbxhw2@ep-summer-bread-antyk0b4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function main() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log("DB is AWAKE:", result);
  } catch (e: any) {
    console.error("DB connection failed:", e.message);
  }
}

main();
