import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    // Seed data will be added when schema is defined in next prompt
    console.log('Seed completed (no entities yet).');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
