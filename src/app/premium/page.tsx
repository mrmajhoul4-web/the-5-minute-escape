"use client";

import { motion } from "framer-motion";
import { Check, Crown, Zap, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  "Ad-free experience across all pages",
  "Exclusive premium-only challenges",
  "Advanced statistics and insights",
  "Priority leaderboard placement",
  "Custom profile themes",
  "Early access to new challenge types",
];

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 inline-flex rounded-full bg-yellow-500/10 p-4">
          <Crown className="h-12 w-12 text-yellow-400" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">
          Go <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Premium</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-dark-100">
          Unlock the full experience. No ads, exclusive challenges, and powerful
          tools to track your progress.
        </p>
      </motion.div>

      <div className="mx-auto max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-dark-800 to-dark-900 p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="mb-6 text-center">
            <div className="mb-2 text-sm font-medium text-yellow-400">PREMIUM</div>
            <div className="mb-1 text-5xl font-bold text-white">
              $4.99
            </div>
            <div className="text-dark-200">per month</div>
          </div>

          <ul className="mb-8 space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-500/20 p-1">
                  <Check className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-sm text-dark-100">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-bold text-dark-900 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            Subscribe Now
          </button>

          <p className="mt-4 text-center text-xs text-dark-200">
            Cancel anytime. No questions asked.
          </p>
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/challenge"
          className="text-sm text-dark-200 underline transition-colors hover:text-dark-100"
        >
          No thanks, continue with free version
        </Link>
      </div>
    </div>
  );
}
