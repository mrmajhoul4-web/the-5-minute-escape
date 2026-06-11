"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X, RefreshCw, Brain } from "lucide-react";
import { formatTime, cn } from "@/lib/utils";
import { useTimerStore, useChallengeStore } from "@/lib/store";

type ChallengeView = "start" | "playing" | "completed" | "failed";

export default function ChallengePage() {
  const router = useRouter();
  const timer = useTimerStore();
  const challengeStore = useChallengeStore();
  const [view, setView] = useState<ChallengeView>("start");
  const [challenge, setChallenge] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSequence, setShowSequence] = useState(true);
  const [remembered, setRemembered] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchChallenge();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (timer.isRunning && timer.timeLeft === 0) {
      handleTimeUp();
    }
  }, [timer.timeLeft, timer.isRunning]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch("/api/challenges/today");
      const data = await res.json();
      setChallenge(data.challenge);
      if (data.userScore?.completed) {
        setView("completed");
        setResult(data.userScore);
      }
    } catch (e) {
      console.error("Failed to fetch challenge", e);
    }
  };

  const startChallenge = () => {
    setView("playing");
    timer.startTimer();
    challengeStore.startChallenge();
    intervalRef.current = setInterval(() => {
      timer.tick();
    }, 1000);

    if (challenge?.type === "memory") {
      setShowSequence(true);
      setTimeout(() => setShowSequence(false), 3000);
    }
  };

  const handleTimeUp = () => {
    setView("failed");
    timer.stopTimer();
    challengeStore.completeChallenge();
    playSound("fail");
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    setLoading(true);

    const elapsed = 300 - timer.timeLeft;

    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          answer: challenge.type === "memory" ? remembered : userAnswer,
          time: elapsed,
        }),
      });
      const data = await res.json();

      setResult(data);
      if (data.correct) {
        setView("completed");
        playSound("success");
      } else {
        setView("failed");
        playSound("fail");
      }
    } catch (e) {
      console.error("Failed to submit", e);
    } finally {
      setLoading(false);
      timer.stopTimer();
      if (intervalRef.current) clearInterval(intervalRef.current);
      challengeStore.completeChallenge();
    }
  };

  const playSound = (type: "success" | "fail") => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.value = 800;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.value = 300;
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio not available
    }
  };

  const resetForNewDay = () => {
    setView("start");
    setUserAnswer(null);
    setResult(null);
    timer.resetTimer();
    challengeStore.resetChallenge();
    fetchChallenge();
  };

  const timerColor = timer.timeLeft > 120
    ? "text-neon-green"
    : timer.timeLeft > 60
    ? "text-yellow-400"
    : "text-red-500 animate-countdown-warning";

  if (!challenge) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-dark-200">Loading challenge...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AnimatePresence mode="wait">
        {view === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center"
          >
            <div className="mb-8 rounded-full bg-neon-blue/10 p-6">
              <Brain className="h-16 w-16 text-neon-blue" />
            </div>
            <h1 className="mb-4 text-4xl font-bold">Today&apos;s Challenge</h1>
            <p className="mb-2 text-xl text-white">{challenge.title}</p>
            <p className="mb-8 text-dark-100">{challenge.description}</p>
            <div className="mb-8 flex items-center gap-4 text-sm text-dark-200">
              <span className="rounded-full border border-dark-600 px-3 py-1 capitalize">
                {challenge.type}
              </span>
              <span className="rounded-full border border-dark-600 px-3 py-1">
                {challenge.points} pts
              </span>
              <span className="rounded-full border border-dark-600 px-3 py-1">
                Difficulty: {challenge.difficulty}/5
              </span>
            </div>
            <button
              onClick={startChallenge}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]"
            >
              <Clock className="h-5 w-5" />
              Start Timer (5:00)
            </button>
          </motion.div>
        )}

        {view === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <div className="mb-8 text-center">
              <div className={cn("text-6xl font-bold tabular-nums", timerColor)}>
                {formatTime(timer.timeLeft)}
              </div>
              <div className="mt-2 text-sm text-dark-200">
                Time remaining
              </div>
            </div>

            <div className="mb-8 rounded-xl border border-dark-600 bg-dark-800 p-8">
              <h2 className="mb-2 text-xl font-semibold">{challenge.title}</h2>
              <p className="mb-6 text-dark-100">{challenge.description}</p>
              {renderChallengeContent()}
            </div>
          </motion.div>
        )}

        {view === "completed" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center"
          >
            <div className="mb-6 rounded-full bg-neon-green/10 p-8">
              <Check className="h-16 w-16 text-neon-green" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-neon-green">
              Challenge Complete!
            </h1>
            <p className="mb-8 text-dark-100">
              {result?.totalPoints
                ? `You earned ${result.totalPoints} points!`
                : "Great work!"}
            </p>
            {result && (
              <div className="mb-8 grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg border border-dark-600 bg-dark-800 p-4">
                  <div className="text-2xl font-bold text-neon-blue">
                    {result.totalPoints || 0}
                  </div>
                  <div className="text-sm text-dark-200">Total Points</div>
                </div>
                <div className="rounded-lg border border-dark-600 bg-dark-800 p-4">
                  <div className="text-2xl font-bold text-neon-purple">
                    +{result.bonusPoints || 0}
                  </div>
                  <div className="text-sm text-dark-200">Bonus Points</div>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/leaderboard")}
                className="rounded-xl border border-dark-600 px-6 py-3 text-white transition-colors hover:bg-dark-700"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="rounded-xl bg-neon-blue px-6 py-3 font-semibold text-dark-900 transition-all hover:bg-neon-blue/80"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        )}

        {view === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center"
          >
            <div className="mb-6 rounded-full bg-red-500/10 p-8">
              <X className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-red-500">
              Time&apos;s Up!
            </h1>
            <p className="mb-8 text-dark-100">
              {result && !result.correct
                ? "That wasn't quite right. Try again tomorrow!"
                : "Don't worry, a new challenge awaits tomorrow!"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-bold text-white transition-all hover:scale-105"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function renderChallengeContent() {
    switch (challenge.type) {
      case "logic":
        return renderLogicChallenge();
      case "word":
        return renderWordChallenge();
      case "pattern":
        return renderPatternChallenge();
      case "memory":
        return renderMemoryChallenge();
      case "mini-game":
        return renderMiniGameChallenge();
      case "trivia":
        return renderTriviaChallenge();
      case "anagram":
        return renderAnagramChallenge();
      case "number-sequence":
        return renderNumberSequenceChallenge();
      default:
        return <div>Unknown challenge type</div>;
    }
  }

  function renderLogicChallenge() {
    const options = challenge.content.options || [];
    return (
      <div>
        <div className="mb-6 text-center text-3xl font-bold text-neon-blue">
          {challenge.content.num1} {challenge.content.operation} {challenge.content.num2}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt: number, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "rounded-xl border p-4 text-xl font-bold transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                  : "border-dark-600 bg-dark-700 text-white hover:border-dark-400"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }

  function renderWordChallenge() {
    return (
      <div className="text-center">
        <div className="mb-4 text-sm text-dark-200">
          Hint: {challenge.content.hint}
        </div>
        <div className="mb-6 text-4xl font-bold tracking-[0.5em] text-neon-purple">
          {challenge.content.scrambled}
        </div>
        <input
          type="text"
          value={userAnswer || ""}
          onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
          placeholder="Type your answer..."
          className="mb-4 w-full rounded-xl border border-dark-600 bg-dark-700 px-4 py-3 text-center text-xl text-white outline-none focus:border-neon-blue"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !userAnswer}
          className="w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Answer"}
        </button>
      </div>
    );
  }

  function renderPatternChallenge() {
    const options = challenge.content.options || [];
    return (
      <div>
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold text-neon-blue">
            {challenge.content.sequence.join("  →  ")}
          </div>
          <div className="mt-2 text-lg text-dark-200">→ ?</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt: number, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "rounded-xl border p-4 text-xl font-bold transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                  : "border-dark-600 bg-dark-700 text-white hover:border-dark-400"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }

  function renderMemoryChallenge() {
    const sequence = challenge.content.sequence || [];
    return (
      <div>
        {showSequence ? (
          <div className="text-center">
            <p className="mb-4 text-dark-200">Memorize this sequence:</p>
            <div className="flex justify-center gap-4">
              {sequence.map((sym: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-dark-700 text-2xl"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-dark-200">Recall the sequence:</p>
            <div className="flex justify-center gap-4">
              {sequence.map((_: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    const symbols = ["★", "●", "▲", "■", "◆", "♥", "♦", "♣"];
                    const current = remembered[i] || "";
                    const idx = symbols.indexOf(current);
                    const next = symbols[(idx + 1) % symbols.length];
                    const newR = [...remembered];
                    newR[i] = next;
                    setRemembered(newR);
                  }}
                  className={cn(
                    "inline-flex h-16 w-16 items-center justify-center rounded-xl border text-2xl transition-all",
                    remembered[i]
                      ? "border-neon-blue bg-neon-blue/20"
                      : "border-dark-600 bg-dark-700"
                  )}
                >
                  {remembered[i] || "?"}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || remembered.length < sequence.length}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderMiniGameChallenge() {
    const options = challenge.content.options || [];
    return (
      <div className="text-center">
        <div
          className="mb-6 text-5xl font-bold"
          style={{ color: challenge.content.color.toLowerCase() }}
        >
          {challenge.content.text}
        </div>
        <p className="mb-4 text-sm text-dark-200">
          What color is the text? (Not the word itself)
        </p>
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              style={{ color: opt.toLowerCase() }}
              className={cn(
                "rounded-xl border p-4 text-lg font-bold transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20"
                  : "border-dark-600 bg-dark-700 hover:border-dark-400"
              )}
            >
              {opt.charAt(0) + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }

  function renderTriviaChallenge() {
    const options = challenge.content.options || [];
    return (
      <div>
        <p className="mb-6 text-lg text-white">{challenge.content.question}</p>
        <div className="space-y-3">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "w-full rounded-xl border p-4 text-left font-medium transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                  : "border-dark-600 bg-dark-700 text-white hover:border-dark-400"
              )}
            >
              <span className="mr-3 text-dark-200">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }

  function renderAnagramChallenge() {
    const options = challenge.content.options || [];
    return (
      <div className="text-center">
        <div className="mb-6 text-4xl font-bold tracking-[0.3em] text-neon-purple">
          {challenge.content.clue}
        </div>
        <p className="mb-4 text-sm text-dark-200">Which word can be formed from these letters?</p>
        <div className="space-y-3">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "w-full rounded-xl border p-4 text-lg font-medium transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                  : "border-dark-600 bg-dark-700 text-white hover:border-dark-400"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }

  function renderNumberSequenceChallenge() {
    const options = challenge.content.options || [];
    const sequence = challenge.content.sequence || [];
    return (
      <div>
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold text-neon-blue">
            {sequence.join("  →  ")}
          </div>
          <div className="mt-2 text-lg text-dark-200">→ ?</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt: number, i: number) => (
            <button
              key={i}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "rounded-xl border p-4 text-xl font-bold transition-all",
                userAnswer === opt
                  ? "border-neon-blue bg-neon-blue/20 text-neon-blue"
                  : "border-dark-600 bg-dark-700 text-white hover:border-dark-400"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {userAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        )}
      </div>
    );
  }
}
