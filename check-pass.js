const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });
const prisma = new PrismaClient({ log: ['error'] });

async function check() {
    const user = await prisma.user.findUnique({ where: { email: 'admin@ecity.com' } });
    if (user) {
        console.log(`Found: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Password looks hashed: ${user.password?.startsWith('$2')}`);
        console.log(`Password is "admin" (plain): ${user.password === 'admin'}`);
        const hashMatch = await bcrypt.compare('admin', user.password);
        console.log(`Password "admin" hash match: ${hashMatch}`);
    } else {
        console.log('User not found');
    }
    await prisma.$disconnect();
}
check().catch(e => { console.error(e.message); prisma.$disconnect(); });
