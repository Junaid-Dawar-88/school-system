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

  // Find admin
  const admin = await prisma.user.findFirst({ where: { email: "junaid@admin.com" } });
  if (!admin) {
    console.log("No admin found, run seed.ts first");
    return;
  }

  console.log("Admin found:", admin.id);
  console.log("Current password hash:", admin.password);
  console.log("Has org:", admin.organizationId);

  // Test current password
  const test = await bcrypt.compare("khan12!@", admin.password);
  console.log("Password 'khan12!@' matches:", test);

  if (!test) {
    // Re-hash and update
    const newHash = await bcrypt.hash("khan12!@", 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: newHash },
    });
    console.log("Password updated!");

    // Verify
    const verify = await bcrypt.compare("khan12!@", newHash);
    console.log("Verification:", verify);
  }

  // Make sure org link exists
  if (!admin.organizationId) {
    const org = await prisma.organization.findFirst({ where: { ownerId: admin.id } });
    if (org) {
      await prisma.user.update({ where: { id: admin.id }, data: { organizationId: org.id } });
      console.log("Linked admin to org:", org.id);
    } else {
      console.log("ERROR: No organization found for admin");
    }
  }
}

main().catch(console.error);
