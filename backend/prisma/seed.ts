import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('draco123', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@draco.mx' },
    update: {},
    create: {
      nombre: 'Administrador Draco',
      email: 'admin@draco.mx',
      passwordHash,
      rol: 'ADMIN',
    },
  });

  console.log('Usuario de prueba creado:', usuario.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });