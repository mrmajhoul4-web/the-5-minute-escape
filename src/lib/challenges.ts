export type ChallengeType =
  | "logic"
  | "memory"
  | "word"
  | "pattern"
  | "mini-game";

export interface ChallengeData {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  content: any;
  solution: any;
  difficulty: number;
  points: number;
}

const CHALLENGES: Record<string, ChallengeData> = {};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeedForDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateLogicChallenge(seed: number): ChallengeData {
  const rng = () => seededRandom(seed++);
  const num1 = Math.floor(rng() * 90) + 10;
  const num2 = Math.floor(rng() * 90) + 10;
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(rng() * ops.length)];
  const correctAnswer = op === "+" ? num1 + num2 : op === "-" ? num1 - num2 : num1 * num2;

  const options = [correctAnswer];
  while (options.length < 4) {
    const offset = Math.floor(rng() * 20) - 10;
    const wrong = correctAnswer + offset;
    if (!options.includes(wrong) && wrong >= 0) options.push(wrong);
  }
  options.sort(() => rng() - 0.5);

  return {
    id: `logic-${Math.floor(seed)}`,
    type: "logic",
    title: "Quick Calculation",
    description: `Solve: ${num1} ${op} ${num2} = ?`,
    content: { num1, num2, operation: op, options },
    solution: correctAnswer,
    difficulty: 1,
    points: 100,
  };
}

function generateWordChallenge(seed: number): ChallengeData {
  const rng = () => seededRandom(seed++);
  const words = [
    { scrambled: "ELPPA", answer: "APPLE", hint: "A fruit" },
    { scrambled: "CETPURMO", answer: "COMPUTER", hint: "Electronic device" },
    { scrambled: "OKBO", answer: "BOOK", hint: "You read this" },
    { scrambled: "HICRA", answer: "CHAIR", hint: "You sit on it" },
    { scrambled: "PELTEHNA", answer: "ELEPHANT", hint: "Large animal" },
    { scrambled: "RANIGE", answer: "TRAIN", hint: "Mode of transport" },
    { scrambled: "BILERARY", answer: "LIBRARY", hint: "Place with books" },
    { scrambled: "LACSSIM", answer: "CLASSIC", hint: "Timeless" },
    { scrambled: "WNODWIE", answer: "WINDOW", hint: "You look through it" },
    { scrambled: "GARDEN", answer: "DANGER", hint: "Be careful!" },
  ];

  const word = words[Math.floor(rng() * words.length)];
  return {
    id: `word-${Math.floor(seed)}`,
    type: "word",
    title: "Word Scramble",
    description: `Unscramble this word: "${word.scrambled}"`,
    content: { scrambled: word.scrambled, hint: word.hint },
    solution: word.answer,
    difficulty: 2,
    points: 150,
  };
}

function generatePatternChallenge(seed: number): ChallengeData {
  const rng = () => seededRandom(seed++);
  const start = Math.floor(rng() * 10) + 1;
  const step = Math.floor(rng() * 5) + 1;
  const sequence = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(start + i * step);
  }
  const next = start + 4 * step;

  const options = [next];
  while (options.length < 4) {
    const offset = Math.floor(rng() * 10) - 5;
    const wrong = next + offset;
    if (!options.includes(wrong) && wrong > 0) options.push(wrong);
  }
  options.sort(() => rng() - 0.5);

  return {
    id: `pattern-${Math.floor(seed)}`,
    type: "pattern",
    title: "Pattern Recognition",
    description: `What comes next? ${sequence.join(", ")}, ?`,
    content: { sequence, options },
    solution: next,
    difficulty: 2,
    points: 150,
  };
}

function generateMemoryChallenge(seed: number): ChallengeData {
  const rng = () => seededRandom(seed++);
  const symbols = ["★", "●", "▲", "■", "◆", "♥", "♦", "♣"];
  const sequence: string[] = [];
  const length = 5;
  for (let i = 0; i < length; i++) {
    sequence.push(symbols[Math.floor(rng() * symbols.length)]);
  }

  return {
    id: `memory-${Math.floor(seed)}`,
    type: "memory",
    title: "Memory Sequence",
    description: "Memorize this sequence of symbols, then recall them in order.",
    content: { sequence, displayTime: 3 },
    solution: sequence,
    difficulty: 3,
    points: 200,
  };
}

function generateMiniGameChallenge(seed: number): ChallengeData {
  const rng = () => seededRandom(seed++);
  const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"];
  const color = colors[Math.floor(rng() * colors.length)];
  const text = colors[Math.floor(rng() * colors.length)];
  const isCongruent = color === text;

  return {
    id: `minigame-${Math.floor(seed)}`,
    type: "mini-game",
    title: "Stroop Test",
    description: `What color is the text? (Not what word it spells)`,
    content: { text, color, isCongruent, options: colors.slice(0, 4) },
    solution: color,
    difficulty: 1,
    points: 100,
  };
}

export function getDailyChallenge(dateStr: string): ChallengeData {
  if (CHALLENGES[dateStr]) return CHALLENGES[dateStr];

  const seed = getSeedForDate(dateStr);
  const typeIndex = Math.floor(seededRandom(seed) * 5);
  const generators = [
    generateLogicChallenge,
    generateWordChallenge,
    generatePatternChallenge,
    generateMemoryChallenge,
    generateMiniGameChallenge,
  ];

  const challenge = generators[typeIndex](seed + 1);
  CHALLENGES[dateStr] = challenge;
  return challenge;
}

export function generateChallengeFromContent(content: any, type: string) {
  switch (type) {
    case "logic":
      return {
        type: "logic" as const,
        title: content.title || "Custom Logic Challenge",
        description: content.description || "",
        content: { num1: content.num1, num2: content.num2, operation: content.operation, options: content.options },
        solution: content.solution,
        difficulty: content.difficulty || 1,
        points: content.points || 100,
      };
    case "word":
      return {
        type: "word" as const,
        title: content.title || "Custom Word Challenge",
        description: content.description || "",
        content: { scrambled: content.scrambled, hint: content.hint },
        solution: content.solution,
        difficulty: content.difficulty || 2,
        points: content.points || 150,
      };
    case "pattern":
      return {
        type: "pattern" as const,
        title: content.title || "Custom Pattern Challenge",
        description: content.description || "",
        content: { sequence: content.sequence, options: content.options },
        solution: content.solution,
        difficulty: content.difficulty || 2,
        points: content.points || 150,
      };
    case "memory":
      return {
        type: "memory" as const,
        title: content.title || "Custom Memory Challenge",
        description: content.description || "",
        content: { sequence: content.sequence, displayTime: content.displayTime || 3 },
        solution: content.solution,
        difficulty: content.difficulty || 3,
        points: content.points || 200,
      };
    case "mini-game":
      return {
        type: "mini-game" as const,
        title: content.title || "Custom Mini Game",
        description: content.description || "",
        content: { text: content.text, color: content.color, options: content.options },
        solution: content.solution,
        difficulty: content.difficulty || 1,
        points: content.points || 100,
      };
    default:
      return null;
  }
}
