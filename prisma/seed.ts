import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create a default category
  const generalCategory = await prisma.category.upsert({
    where: { id: 'cl_general_category_01' }, // hardcoded id for predictability
    update: {},
    create: {
      id: 'cl_general_category_01',
      name: 'General',
      isSystem: true,
    },
  });

  console.log(`Created system category: ${generalCategory.name}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
