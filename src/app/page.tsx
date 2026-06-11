"use client";

import Link from "next/link";
import { ArrowRight, Zap, Trophy, Users, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export default function HomePage() {
  const { colors } = useTheme();
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse_at_top, ${colors.primary}15, transparent 50%)`,
        }}
      />

      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-4 py-1.5 text-sm text-neon-blue">
            <Sparkles className="h-4 w-4" />
            New challenge every day
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
            The{" "}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              5-Minute
            </span>{" "}
            Escape
          </h1>

          <p className="mb-8 text-lg text-dark-100 sm:text-xl">
            Quick brain challenges designed for your short breaks.
            <br />
            Solve puzzles, beat the clock, and climb the global leaderboard.
          </p>

          <Link
            href="/challenge"
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]"
          >
            Start Challenge
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid w-full max-w-5xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: Zap,
              title: "Quick Challenges",
              desc: "5 minutes or less",
              color: "text-neon-blue",
              bg: "bg-neon-blue/10",
            },
            {
              icon: Trophy,
              title: "Global Ranks",
              desc: "Compete worldwide",
              color: "text-neon-yellow",
              bg: "bg-yellow-500/10",
            },
            {
              icon: Clock,
              title: "Daily Reset",
              desc: "Fresh puzzle every day",
              color: "text-neon-green",
              bg: "bg-neon-green/10",
            },
            {
              icon: Users,
              title: "Free to Play",
              desc: "No account needed",
              color: "text-neon-pink",
              bg: "bg-neon-pink/10",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-dark-600/50 bg-dark-800/50 p-6 backdrop-blur-sm transition-colors hover:border-dark-400"
            >
              <div
                className={`mb-4 inline-flex rounded-lg ${item.bg} ${item.color} p-3`}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-dark-100">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
