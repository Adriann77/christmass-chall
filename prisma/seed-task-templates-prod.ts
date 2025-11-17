import { PrismaClient } from '@prisma/client';

// Use production schema for this script
const prisma = new PrismaClient();

async function main() {
  const defaultTasks = [
    { name: '10 000 kroków', icon: 'TrendingUp', sortOrder: 1 },
    { name: 'Trening/Rozciąganie', icon: 'Dumbbell', sortOrder: 2 },
    { name: 'Zdrowa dieta', icon: 'Apple', sortOrder: 3 },
    { name: 'Czytanie książki', icon: 'Book', sortOrder: 4 },
    { name: 'Nauka (1 godzina)', icon: 'GraduationCap', sortOrder: 5 },
    { name: '2.5 litra wody', icon: 'Droplet', sortOrder: 6 },
  ];

  // Get all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Check if user already has task templates
    const existingTemplates = await prisma.taskTemplate.findMany({
      where: { userId: user.id },
    });

    if (existingTemplates.length === 0) {
      console.log(`Creating default tasks for user: ${user.username}`);

      for (const task of defaultTasks) {
        await prisma.taskTemplate.create({
          data: {
            userId: user.id,
            name: task.name,
            icon: task.icon,
            sortOrder: task.sortOrder,
          },
        });
      }
    } else {
      console.log(
        `User ${user.username} already has ${existingTemplates.length} task templates`,
      );
    }
  }

  console.log(`✅ Completed seeding task templates for ${users.length} users`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
