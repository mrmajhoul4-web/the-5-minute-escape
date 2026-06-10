import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const guestPassword = Math.random().toString(36).slice(2, 15);
    const passwordHash = await bcrypt.hash(guestPassword, 12);

    const email = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@guest.local`;

    const user = await prisma.user.create({
      data: {
        name: `Player ${Math.floor(Math.random() * 10000)}`,
        email,
        isGuest: true,
        passwordHash,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email,
      isGuest: true,
      guestPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create guest account" },
      { status: 500 }
    );
  }
}
