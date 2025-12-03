const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './server/.env' });
const prisma = new PrismaClient({ log: ['error'] });

async function check() {
    const users = await prisma.user.findMany({ take: 10, select: { email: true, role: true, name: true } });
    console.log('All users in database:');
    users.forEach((u, i) => console.log(`${i + 1}. ${u.email} - Role: ${u.role} - Name: ${u.name || 'N/A'}`));
    console.log(`\nTotal: ${users.length} users`);
    await prisma.$disconnect();
}
check().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
