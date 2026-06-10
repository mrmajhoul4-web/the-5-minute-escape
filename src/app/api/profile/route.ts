import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUnlockedAchievements, checkAchievements } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        scores: { where: { completed: true } },
        streak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const achievements = await getUnlockedAchievements(user.id);
    const totalPoints = user.scores.reduce((sum, s) => sum + s.totalPoints, 0);
    const bestTime = user.scores.length > 0
      ? Math.min(...user.scores.map((s) => s.time))
      : null;

    const userRank = await prisma.score.groupBy({
      by: ["userId"],
      _sum: { totalPoints: true },
      orderBy: { _sum: { totalPoints: "desc" } },
    });
    const rank = userRank.findIndex((r) => r.userId === user.id) + 1;

    await checkAchievements(user.id);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isPremium: user.isPremium,
      isAdmin: user.isAdmin,
      isGuest: user.isGuest,
      stats: {
        challengesCompleted: user.scores.length,
        totalPoints,
        bestTime,
        currentRank: rank > 0 ? rank : null,
        streak: user.streak?.currentStreak || 0,
        longestStreak: user.streak?.longestStreak || 0,
      },
      achievements: achievements.map((ua) => ({
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
