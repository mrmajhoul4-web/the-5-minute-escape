"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<"challenges" | "users">("challenges");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: "",
    type: "logic",
    title: "",
    description: "",
    difficulty: 1,
    points: 100,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if ((session?.user as any)?.isAdmin) {
      fetchData();
    }
  }, [session, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "challenges") {
        const res = await fetch("/api/admin/challenges");
        const data = await res.json();
        setChallenges(data.challenges || []);
      } else {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
      }
    } catch (e) {
      console.error("Failed to create challenge", e);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-dark-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-neon-purple" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-dark-100">Manage challenges and players</p>
      </motion.div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("challenges")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === "challenges"
              ? "bg-neon-purple text-white"
              : "border border-dark-600 text-dark-100 hover:border-dark-400"
          }`}
        >
          <Calendar className="mr-1 inline h-4 w-4" />
          Challenges
        </button>
        <button
          onClick={() => setTab("users")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === "users"
              ? "bg-neon-purple text-white"
              : "border border-dark-600 text-dark-100 hover:border-dark-400"
          }`}
        >
          <Users className="mr-1 inline h-4 w-4" />
          Users
        </button>
      </div>

      {tab === "challenges" && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 inline-flex items-center gap-2 rounded-lg bg-neon-blue px-4 py-2 text-sm font-semibold text-dark-900 transition-all hover:bg-neon-blue/80"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "New Challenge"}
          </button>

          {showForm && (
            <form
              onSubmit={createChallenge}
              className="mb-6 rounded-xl border border-dark-600 bg-dark-800 p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                  >
                    <option value="logic">Logic</option>
                    <option value="word">Word</option>
                    <option value="pattern">Pattern</option>
                    <option value="memory">Memory</option>
                    <option value="mini-game">Mini Game</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Difficulty (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        difficulty: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-100">Points</label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        points: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white outline-none focus:border-neon-purple"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink px-6 py-2 font-semibold text-white"
              >
                Create Challenge
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-10 text-center text-dark-200">Loading...</div>
          ) : (
            <div className="space-y-3">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between rounded-xl border border-dark-600 bg-dark-800 p-4"
                >
                  <div>
                    <div className="font-semibold text-white">{ch.title}</div>
                    <div className="text-sm text-dark-200">
                      {new Date(ch.date).toLocaleDateString()}  ·  {ch.type}  ·  {ch.points}pts
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-dark-600 p-2 text-dark-200 transition-colors hover:border-neon-blue hover:text-neon-blue">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-dark-600 p-2 text-dark-200 transition-colors hover:border-red-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "users" && (
        <>
          {loading ? (
            <div className="py-10 text-center text-dark-200">Loading...</div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-dark-600 bg-dark-800 p-4"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {u.name || "Anonymous"}
                    </div>
                    <div className="text-sm text-dark-200">
                      {u.email || "No email"}  ·  {u._count.scores} challenges
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {u.isAdmin && (
                      <span className="rounded bg-neon-purple/20 px-2 py-0.5 text-neon-purple">
                        Admin
                      </span>
                    )}
                    {u.isPremium && (
                      <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-yellow-400">
                        Premium
                      </span>
                    )}
                    {u.isGuest && (
                      <span className="rounded bg-dark-600 px-2 py-0.5 text-dark-200">
                        Guest
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
