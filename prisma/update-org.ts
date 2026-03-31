import "dotenv/config";

async function main() {
  const { PrismaClient } = await import("../lib/generated/prisma/client");
  const { PrismaNeonHttp } = await import("@prisma/adapter-neon");
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter });

  const org = await prisma.organization.findFirst();
  if (!org) { console.log("No org found"); return; }

  await prisma.organization.update({ where: { id: org.id }, data: { name: "Dawlloom" } });
  console.log("Updated:", org.name, "→ Dawlloom");
}

main().catch(console.error);
