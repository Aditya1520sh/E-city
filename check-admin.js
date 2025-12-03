// Database check script to verify admin user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

const prisma = new PrismaClient();

async function checkAdminUser() {
    try {
        console.log('Checking database connection...');

        // Try to find user with both email variations
        const emails = ['admin@Ecity.com', 'admin@ecity.com'];

        for (const email of emails) {
            console.log(`\nChecking for user: ${email}`);
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                console.log('✅ User found!');
                console.log('User details:');
                console.log('- ID:', user.id);
                console.log('- Email:', user.email);
                console.log('- Name:', user.name);
                console.log('- Role:', user.role);
                console.log('- Has password:', !!user.password);
                console.log('- Password length:', user.password?.length || 0);
                console.log('- Looks hashed:', user.password?.startsWith('$2') || false);

                // Test password
                if (user.password) {
                    const isPlainText = user.password === 'admin';
                    const isHashedMatch = await bcrypt.compare('admin', user.password);

                    console.log('- Plain text "admin":', isPlainText);
                    console.log('- Hashed "admin" match:', isHashedMatch);

                    if (!isPlainText && !isHashedMatch) {
                        console.log('⚠️ WARNING: Password doesn\'t match "admin" in plain or hashed form!');
                    }
                }
            } else {
                console.log('❌ No user found with email:', email);
            }
        }

        // Count total users
        const totalUsers = await prisma.user.count();
        console.log(`\nTotal users in database: ${totalUsers}`);

        // List all users (limit to 5)
        console.log('\nAll users (first 5):');
        const allUsers = await prisma.user.findMany({
            take: 5,
            select: { id: true, email: true, name: true, role: true }
        });
        console.table(allUsers);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminUser();
