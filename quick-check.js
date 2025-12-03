const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './server/.env' });
const prisma = new PrismaClient({ log: ['error'] });

async function check() {
    const user = await prisma.user.findUnique({ where: { email: 'admin@Ecity.com' } });
    console.log(JSON.stringify({ found: !!user, email: user?.email, role: user?.role, hasPass: !!user?.password, passLen: user?.password?.length }, null, 2));
    await prisma.$disconnect();
}
check().catch(e => { console.error(e.message); prisma.$disconnect(); });
