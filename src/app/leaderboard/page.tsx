"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Clock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "alltime";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?period=${period}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-4 inline-flex rounded-full bg-neon-yellow/10 p-4">
          <Trophy className="h-10 w-10 text-yellow-400" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">Global Leaderboard</h1>
        <p className="text-dark-100">
          Top players competing in daily challenges
        </p>
      </motion.div>

      <div className="mb-8 flex justify-center gap-2">
        {[
          { key: "daily", label: "Daily" },
          { key: "weekly", label: "Weekly" },
          { key: "alltime", label: "All Time" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key as Period)}
            className={cn(
              "rounded-lg px-6 py-2 text-sm font-medium transition-all",
              period === p.key
                ? "bg-neon-blue text-dark-900"
                : "border border-dark-600 text-dark-100 hover:border-dark-400"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-dark-200">Loading...</div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-20 text-center text-dark-200">
          No scores yet for this period. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                index < 3
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : "border-dark-600 bg-dark-800 hover:border-dark-400"
              )}
            >
              <div className="flex w-10 justify-center">
                {index < 3 ? (
                  <Medal className={cn("h-6 w-6", rankColors[index])} />
                ) : (
                  <span className="text-lg font-bold text-dark-200">
                    {entry.rank}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-white">{entry.name}</div>
                <div className="text-sm text-dark-200">
                  {entry.challengesCompleted} challenges
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-neon-blue">
                  {entry.totalPoints.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-dark-200">
                  <Clock className="h-3 w-3" />
                  {entry.bestTime}s best
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
