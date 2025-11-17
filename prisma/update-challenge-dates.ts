import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set challenge start date to Nov 17, 2025 for all existing users
  const challengeStartDate = new Date(2025, 10, 17); // Month is 0-indexed
  challengeStartDate.setHours(0, 0, 0, 0);

  const result = await prisma.user.updateMany({
    data: {
      challengeStartDate: challengeStartDate,
    },
  });

  console.log(`✅ Updated ${result.count} users with challenge start date: ${challengeStartDate.toLocaleDateString()}`);
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
