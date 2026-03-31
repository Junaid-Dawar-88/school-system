import "dotenv/config";

async function main() {
  const { PrismaClient } = await import("../lib/generated/prisma/client");
  const { PrismaNeonHttp } = await import("@prisma/adapter-neon");
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter });

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  console.log("Admin org:", admin?.organizationId);

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", organizationId: admin?.organizationId || "" },
    select: { id: true, name: true },
  });
  console.log("Teachers:", teachers);

  if (teachers.length > 0 && admin?.organizationId) {
    try {
      const cls = await prisma.class.create({
        data: { name: "Test-" + Date.now(), organizationId: admin.organizationId },
      });
      console.log("Class created:", cls.id);

      const ct = await prisma.classTeacher.create({
        data: { classId: cls.id, teacherId: teachers[0].id, subject: "Mathematics" },
      });
      console.log("ClassTeacher created:", ct.id);

      // Cleanup
      await prisma.classTeacher.delete({ where: { id: ct.id } });
      await prisma.class.delete({ where: { id: cls.id } });
      console.log("OK - class creation works");
    } catch (e: any) {
      console.error("ERROR:", e.message);
    }
  } else {
    console.log("No teachers found - add a teacher first");
  }
}

main().catch(console.error);
