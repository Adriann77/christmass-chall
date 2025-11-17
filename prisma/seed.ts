import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adrianPassword = await bcrypt.hash('adrian', 10);
  const justynaPassword = await bcrypt.hash('justyna', 10);

  // Create users
  const adrian = await prisma.user.upsert({
    where: { username: 'adrian' },
    update: {},
    create: {
      username: 'adrian',
      password: adrianPassword,
      name: 'Adrian',
    },
  });

  const justyna = await prisma.user.upsert({
    where: { username: 'justyna' },
    update: {},
    create: {
      username: 'justyna',
      password: justynaPassword,
      name: 'Justyna',
    },
  });

  console.log('✅ Seeded users:', { adrian, justyna });

  // Create default task templates for both users
  const defaultTasks = [
    { name: '10 000 kroków', icon: 'TrendingUp', sortOrder: 1 },
    { name: 'Trening/Rozciąganie', icon: 'Dumbbell', sortOrder: 2 },
    { name: 'Zdrowa dieta', icon: 'Apple', sortOrder: 3 },
    { name: 'Czytanie książki', icon: 'Book', sortOrder: 4 },
    { name: 'Nauka (1 godzina)', icon: 'GraduationCap', sortOrder: 5 },
    { name: '2.5 litra wody', icon: 'Droplet', sortOrder: 6 },
  ];

  for (const user of [adrian, justyna]) {
    for (const task of defaultTasks) {
      await prisma.taskTemplate.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: task.name,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name: task.name,
          icon: task.icon,
          sortOrder: task.sortOrder,
        },
      });
    }
  }

  console.log('✅ Seeded default task templates');

  // Initialize daily tasks for all days from today until December 24, 2025
  const today = new Date();
  const christmasDate = new Date(2025, 11, 24);

  // Start from today or December 1st, whichever is earlier
  const startDate = new Date(
    Math.min(today.getTime(), new Date(2025, 11, 1).getTime()),
  );
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(christmasDate);
  endDate.setHours(0, 0, 0, 0);

  // Create tasks for each day from start to end
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);

    // Create daily task for Adrian
    await prisma.dailyTask.upsert({
      where: {
        userId_date: {
          userId: adrian.id,
          date: date,
        },
      },
      update: {},
      create: {
        userId: adrian.id,
        date: date,
      },
    });

    // Create daily task for Justyna
    await prisma.dailyTask.upsert({
      where: {
        userId_date: {
          userId: justyna.id,
          date: date,
        },
      },
      update: {},
      create: {
        userId: justyna.id,
        date: date,
      },
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(
    `✅ Seeded daily tasks from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
  );
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
