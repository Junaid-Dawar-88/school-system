import "dotenv/config";
import bcrypt from "bcryptjs";

async function main() {
  const { PrismaClient } = await import("../lib/generated/prisma/client");
  const { PrismaNeonHttp } = await import("@prisma/adapter-neon");

  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {
    arrayMode: false,
    fullResults: true,
  });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const hashed = await bcrypt.hash("khan12!@", 10);

  const admin = await prisma.user.create({
    data: { name: "junaid", email: "junaid@admin.com", password: hashed, role: "ADMIN" },
  });

  const org = await prisma.organization.create({
    data: { name: "Default School", ownerId: admin.id },
  });

  await prisma.user.update({
    where: { id: admin.id },
    data: { organizationId: org.id },
  });

  console.log("Admin created:");
  console.log("  Email: junaid@admin.com");
  console.log("  Password: khan12!@");
  console.log("  Organization:", org.name);
  console.log("  Invite Code:", org.inviteCode);
}

main().catch(console.error);
