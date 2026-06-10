"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Trophy,
  Clock,
  Flame,
  Medal,
  Star,
  Zap,
  Calendar,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-dark-200">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const stats = profile.stats;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple p-1">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-full w-full rounded-full"
            />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-dark-100">
          {profile.isPremium ? "Premium Member" : "Free Player"}
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            icon: Trophy,
            label: "Rank",
            value: stats.currentRank ? `#${stats.currentRank}` : "N/A",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            icon: Star,
            label: "Points",
            value: stats.totalPoints?.toLocaleString() || "0",
            color: "text-neon-blue",
            bg: "bg-neon-blue/10",
          },
          {
            icon: Flame,
            label: "Streak",
            value: `${stats.streak} days`,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
          {
            icon: Clock,
            label: "Best Time",
            value: stats.bestTime ? `${stats.bestTime}s` : "N/A",
            color: "text-neon-green",
            bg: "bg-neon-green/10",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-dark-600 bg-dark-800 p-4 text-center"
          >
            <div
              className={`mx-auto mb-2 inline-flex rounded-lg ${item.bg} ${item.color} p-2`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="text-sm text-dark-200">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-dark-600 bg-dark-800 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Medal className="h-5 w-5 text-yellow-400" />
          Achievements
        </h2>
        {profile.achievements?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.achievements.map((ach: any) => (
              <div
                key={ach.key}
                className="rounded-lg border border-dark-600 bg-dark-700 p-3 text-center"
              >
                <div className="mb-1 text-2xl">{ach.icon}</div>
                <div className="text-sm font-medium text-white">{ach.name}</div>
                <div className="mt-1 text-xs text-dark-200">
                  {ach.description}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-dark-200">
            Complete challenges to earn achievements!
          </p>
        )}
      </div>

      <div className="rounded-xl border border-dark-600 bg-dark-800 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-neon-blue" />
          Activity
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-dark-200">Challenges Completed:</span>
            <span className="ml-2 font-semibold text-white">
              {stats.challengesCompleted}
            </span>
          </div>
          <div>
            <span className="text-dark-200">Longest Streak:</span>
            <span className="ml-2 font-semibold text-white">
              {stats.longestStreak} days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
