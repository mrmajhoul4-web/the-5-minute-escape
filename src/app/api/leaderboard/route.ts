import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    let dateFilter: Date | null = null;
    const now = new Date();

    if (period === "daily") {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "weekly") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo;
    }

    const whereClause: any = { completed: true };
    if (dateFilter) {
      whereClause.createdAt = { gte: dateFilter };
    }

    const leaderboard = await prisma.score.groupBy({
      by: ["userId"],
      where: whereClause,
      _sum: { totalPoints: true },
      _min: { time: true },
      _count: { id: true },
      orderBy: { _sum: { totalPoints: "desc" } },
      take: limit,
    });

    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: userMap.get(entry.userId)?.name || "Anonymous",
      image: userMap.get(entry.userId)?.image,
      totalPoints: entry._sum.totalPoints || 0,
      bestTime: entry._min.time || 0,
      challengesCompleted: entry._count.id,
    }));

    return NextResponse.json({ leaderboard: result, period });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
