import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateChallengeFromContent } from "@/lib/challenges";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { date: "desc" },
      take: 100,
    });
    return NextResponse.json({ challenges });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, type, title, description, content, solution, difficulty, points } =
      await req.json();

    const generated = generateChallengeFromContent(content, type);
    if (!generated) {
      return NextResponse.json(
        { error: "Invalid challenge type" },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.create({
      data: {
        date: new Date(date),
        type: generated.type,
        title: title || generated.title,
        description: description || generated.description,
        content: generated.content,
        solution: generated.solution,
        difficulty: difficulty || generated.difficulty,
        points: points || generated.points,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}
