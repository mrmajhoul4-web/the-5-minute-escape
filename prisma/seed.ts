import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      key: "first-win",
      name: "First Win",
      description: "Complete your first challenge",
      icon: "🏆",
      criteria: { type: "challenges_completed", count: 1 },
    },
    {
      key: "streak-7",
      name: "7-Day Streak",
      description: "Complete challenges 7 days in a row",
      icon: "🔥",
      criteria: { type: "streak", count: 7 },
    },
    {
      key: "streak-30",
      name: "30-Day Streak",
      description: "Complete challenges 30 days in a row",
      icon: "💎",
      criteria: { type: "streak", count: 30 },
    },
    {
      key: "top-100",
      name: "Top 100 Player",
      description: "Reach the top 100 on the leaderboard",
      icon: "⭐",
      criteria: { type: "rank", maxRank: 100 },
    },
    {
      key: "speed-master",
      name: "Speed Master",
      description: "Complete a challenge in under 60 seconds",
      icon: "⚡",
      criteria: { type: "time", maxTime: 60 },
    },
    {
      key: "puzzle-genius",
      name: "Puzzle Genius",
      description: "Complete 50 challenges",
      icon: "🧠",
      criteria: { type: "challenges_completed", count: 50 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
  }

  const adminEmail = "admin@5minuteescape.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        isAdmin: true,
        passwordHash: "$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5JpGq0BqL9x7X5Z2X1X1X1X1",
      },
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
