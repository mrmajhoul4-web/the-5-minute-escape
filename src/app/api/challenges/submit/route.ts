import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId, answer, time } = await req.json();

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const solution = challenge.solution as any;
    let isCorrect = false;

    if (Array.isArray(solution)) {
      isCorrect =
        Array.isArray(answer) &&
        solution.length === answer.length &&
        solution.every((v: any, i: number) => v === answer[i]);
    } else {
      isCorrect = String(answer).toLowerCase() === String(solution).toLowerCase();
    }

    const existingScore = await prisma.score.findUnique({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
    });

    const attempts = existingScore ? existingScore.attempts + 1 : 1;
    const bonusPoints = attempts === 1 && isCorrect ? 50 : 0;
    const accuracy = isCorrect ? 100 : 0;
    const timeBonus = time < 60 ? 100 : time < 120 ? 50 : time < 180 ? 25 : 0;
    const totalPoints = isCorrect
      ? challenge.points + bonusPoints + timeBonus
      : 0;

    const score = await prisma.score.upsert({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
      update: {
        time: existingScore ? Math.min(existingScore.time, time) : time,
        attempts,
        points: isCorrect ? challenge.points : (existingScore?.points || 0),
        bonusPoints: existingScore
          ? Math.max(existingScore.bonusPoints, bonusPoints)
          : bonusPoints,
        totalPoints: existingScore
          ? Math.max(existingScore.totalPoints, totalPoints)
          : totalPoints,
        accuracy,
        completed: isCorrect || false,
      },
      create: {
        userId: session.user.id,
        challengeId,
        time,
        attempts,
        points: isCorrect ? challenge.points : 0,
        bonusPoints,
        totalPoints,
        accuracy,
        completed: isCorrect,
      },
    });

    if (isCorrect) {
      await prisma.completedChallenge.upsert({
        where: {
          userId_challengeId: {
            userId: session.user.id,
            challengeId,
          },
        },
        update: { completedAt: new Date() },
        create: {
          userId: session.user.id,
          challengeId,
        },
      });

      await updateStreak(session.user.id);
    }

    return NextResponse.json({
      correct: isCorrect,
      score,
      bonusPoints,
      timeBonus,
      totalPoints,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) {
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedAt: today,
      },
    });
    return;
  }

  const lastDate = streak.lastCompletedAt
    ? new Date(streak.lastCompletedAt)
    : null;
  lastDate?.setHours(0, 0, 0, 0);

  if (lastDate && lastDate.getTime() === today.getTime()) return;

  let newStreak = 1;
  if (lastDate && lastDate.getTime() === yesterday.getTime()) {
    newStreak = streak.currentStreak + 1;
  }

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastCompletedAt: today,
    },
  });
}
