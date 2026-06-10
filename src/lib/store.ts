import { create } from "zustand";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  startTime: number | null;
  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  tick: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  timeLeft: 300,
  isRunning: false,
  isFinished: false,
  startTime: null,
  setTimeLeft: (time) => set({ timeLeft: time }),
  startTimer: () =>
    set({ isRunning: true, isFinished: false, startTime: Date.now() }),
  tick: () =>
    set((state) => {
      if (state.timeLeft <= 1) {
        return { timeLeft: 0, isRunning: false, isFinished: true };
      }
      return { timeLeft: state.timeLeft - 1 };
    }),
  stopTimer: () => set({ isRunning: false }),
  resetTimer: () =>
    set({ timeLeft: 300, isRunning: false, isFinished: false, startTime: null }),
}));

interface ChallengeState {
  currentChallenge: any;
  isActive: boolean;
  isCompleted: boolean;
  answer: any;
  setChallenge: (challenge: any) => void;
  setAnswer: (answer: any) => void;
  startChallenge: () => void;
  completeChallenge: () => void;
  resetChallenge: () => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  currentChallenge: null,
  isActive: false,
  isCompleted: false,
  answer: null,
  setChallenge: (challenge) => set({ currentChallenge: challenge }),
  setAnswer: (answer) => set({ answer }),
  startChallenge: () => set({ isActive: true, isCompleted: false }),
  completeChallenge: () => set({ isActive: false, isCompleted: true }),
  resetChallenge: () =>
    set({
      currentChallenge: null,
      isActive: false,
      isCompleted: false,
      answer: null,
    }),
}));
