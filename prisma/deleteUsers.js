const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  console.log("Usuarios eliminados con éxito");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
