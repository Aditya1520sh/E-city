const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './server/.env' });
const prisma = new PrismaClient({ log: ['error'] });

async function check() {
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    for (const u of users) {
        console.log(`${u.email},${u.role}`);
    }
    await prisma.$disconnect();
}
check().catch(e => { console.error(e.message); prisma.$disconnect(); });
