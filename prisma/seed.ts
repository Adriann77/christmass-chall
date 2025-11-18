import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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
      challengeStartDate: new Date(2025, 10, 17), // Nov 17, 2025
    },
  });

  const justyna = await prisma.user.upsert({
    where: { username: 'justyna' },
    update: {},
    create: {
      username: 'justyna',
      password: justynaPassword,
      name: 'Justyna',
      challengeStartDate: new Date(2025, 10, 17), // Nov 17, 2025
    },
  });

  console.log('✅ Seeded users:', {
    adrian: adrian.username,
    justyna: justyna.username,
  });

  // Create default task templates
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
  console.log('🎉 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
