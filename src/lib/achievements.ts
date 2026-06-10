import { prisma } from "./db";

const ACHIEVEMENT_DEFS = [
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

export async function ensureAchievements() {
  for (const def of ACHIEVEMENT_DEFS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      update: {},
      create: def,
    });
  }
}

export async function checkAchievements(userId: string) {
  const achievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      scores: true,
      streak: true,
    },
  });

  if (!user) return [];

  const totalCompleted = user.scores.filter((s) => s.completed).length;
  const bestTime = Math.min(...user.scores.filter((s) => s.completed).map((s) => s.time));
  const streak = user.streak?.currentStreak || 0;

  const userRank = await prisma.score.groupBy({
    by: ["userId"],
    _sum: { totalPoints: true },
    orderBy: { _sum: { totalPoints: "desc" } },
  });
  const rank = userRank.findIndex((r) => r.userId === userId) + 1;

  const newUnlocks: string[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let earned = false;
    const c = achievement.criteria as any;

    switch (c.type) {
      case "challenges_completed":
        earned = totalCompleted >= c.count;
        break;
      case "streak":
        earned = streak >= c.count;
        break;
      case "rank":
        earned = rank > 0 && rank <= c.maxRank;
        break;
      case "time":
        earned = bestTime <= c.maxTime;
        break;
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newUnlocks.push(achievement.key);
    }
  }

  return newUnlocks;
}

export async function getUnlockedAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
}

export { ACHIEVEMENT_DEFS };
