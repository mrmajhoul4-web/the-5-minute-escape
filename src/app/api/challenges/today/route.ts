import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDailyChallenge } from "@/lib/challenges";
import { getTodayDateString } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const dateStr = getTodayDateString();

    let dbChallenge = await prisma.challenge.findUnique({
      where: { date: new Date(dateStr) },
    });

    if (!dbChallenge) {
      const generated = getDailyChallenge(dateStr);
      dbChallenge = await prisma.challenge.create({
        data: {
          date: new Date(dateStr),
          type: generated.type,
          title: generated.title,
          description: generated.description,
          content: generated.content,
          solution: generated.solution,
          difficulty: generated.difficulty,
          points: generated.points,
        },
      });
    }

    let userScore = null;
    if (session?.user?.id) {
      userScore = await prisma.score.findUnique({
        where: {
          userId_challengeId: {
            userId: session.user.id,
            challengeId: dbChallenge.id,
          },
        },
      });
    }

    return NextResponse.json({
      challenge: {
        id: dbChallenge.id,
        type: dbChallenge.type,
        title: dbChallenge.title,
        description: dbChallenge.description,
        content: dbChallenge.content,
        difficulty: dbChallenge.difficulty,
        points: dbChallenge.points,
      },
      userScore: userScore
        ? {
            completed: userScore.completed,
            time: userScore.time,
            points: userScore.points,
            totalPoints: userScore.totalPoints,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
