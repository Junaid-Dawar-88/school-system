import { neon } from "@neondatabase/serverless";

const url = "postgresql://neondb_owner:npg_a7KAgzvbxhw2@ep-summer-bread-antyk0b4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function main() {
  console.log("Running schema migrations via HTTP...");

  // 1. Add Exam table
  await sql`
    CREATE TABLE IF NOT EXISTS "Exam" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "title" TEXT NOT NULL,
      "description" TEXT,
      "date" TIMESTAMP(3) NOT NULL,
      "subject" TEXT NOT NULL,
      "classId" TEXT NOT NULL,
      "createdById" TEXT NOT NULL,
      "organizationId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Exam_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Exam_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
      CONSTRAINT "Exam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id"),
      CONSTRAINT "Exam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
    )
  `;
  console.log("✓ Exam table created");

  // 2. Add EXAM to NotificationType enum (if not exists)
  try {
    await sql`ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXAM'`;
    console.log("✓ EXAM added to NotificationType");
  } catch (e: any) {
    console.log("  EXAM type already exists or:", e.message);
  }

  // 3. Verify
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log("\nAll tables:", tables.map((t: any) => t.tablename).join(", "));

  const exams = await sql`SELECT COUNT(*) as count FROM "Exam"`;
  console.log("Exam table rows:", exams[0].count);

  console.log("\n✅ Migration complete!");
}

main().catch((e) => console.error("Migration failed:", e.message));
