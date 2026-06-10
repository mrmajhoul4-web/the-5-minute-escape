"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Zap, Menu, X, Trophy, User, LogOut, LayoutDashboard, Crown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/challenge", label: "Challenge" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-dark-600/50 bg-dark-900/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-neon-blue" />
          <span className="text-lg font-bold text-white">
            5<span className="text-neon-blue">Min</span>Escape
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-dark-100 transition-colors hover:text-neon-blue"
            >
              {link.label}
            </Link>
          ))}

          {session?.user ? (
            <div className="flex items-center gap-4">
              {!(session.user as any).isPremium && (
                <Link
                  href="/premium"
                  className="flex items-center gap-1 text-sm text-yellow-400 transition-colors hover:text-yellow-300"
                >
                  <Crown className="h-4 w-4" />
                  Premium
                </Link>
              )}
              {(session.user as any).isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm text-dark-100 transition-colors hover:text-neon-purple"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full bg-dark-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-dark-600"
              >
                <User className="h-4 w-4 text-neon-blue" />
                {session.user.name || "Player"}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-dark-100 transition-colors hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-neon-blue px-4 py-2 text-sm font-semibold text-dark-900 transition-all hover:bg-neon-blue/80 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-dark-600/50 bg-dark-800 px-4 pb-4 pt-2 md:hidden",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-dark-100 transition-colors hover:text-neon-blue"
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              {!(session.user as any).isPremium && (
                <Link
                  href="/premium"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
                >
                  <Crown className="h-4 w-4" />
                  Premium
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-dark-100 hover:text-neon-blue"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm text-dark-100 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-neon-blue px-4 py-2 text-center text-sm font-semibold text-dark-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
