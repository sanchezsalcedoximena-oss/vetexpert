const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const correo = "admin@vetexpert.com";
  const existe = await prisma.usuario.findUnique({
    where: { correo }
  });

  if (existe) {
    console.log(`Seed omitido: el usuario ${correo} ya existe.`);
    return;
  }

  await prisma.usuario.create({
    data: {
      nombres: "Administrador",
      apellidos: "VetExpert",
      correo,
      passwordHash: await hash("Admin123*", 12),
      rol: "ADMIN",
      tipoUsuario: "STAFF",
      activo: true
    }
  });

  console.log(`Seed completado: usuario administrador creado (${correo}).`);
}

main()
  .catch((error) => {
    console.error("Seed admin fallo:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
