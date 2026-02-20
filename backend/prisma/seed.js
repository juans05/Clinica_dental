const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@dental.com' },
        update: {},
        create: {
            email: 'admin@dental.com',
            name: 'Administrador Principal',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
