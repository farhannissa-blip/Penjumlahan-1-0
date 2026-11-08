export interface PancakeChoice {
  id: string;
  value: number;
  plateColor: string;
}

export interface ContextualGasingTip {
  id: string;
  selectedA: number;
  selectedB: number;
  selectedSum: number;
  targetSum: number;
  status: 'too_high' | 'too_low';
  diff: number;
  headline: string;
  mentalMathStep: string;
  strategyAdvice: string;
}

export interface MathQuestion {
  id: string;
  level: number;
  questionNumber: number; // 1 to 10 within level
  numA: number;
  numB: number;
  targetSum: number;
  timeLimitSeconds: number;
  choices: PancakeChoice[];
  gasingTip: string;
}

export interface LevelConfig {
  level: number;
  minSum: number;
  maxSum: number;
  timeSeconds: number;
  title: string;
  kitchenBadge: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  schoolName: string;
  gradeClass: string;
  score: number;
  highestLevel: number;
  correctCount: number;
  cookedPancakes: number;
  burntCount: number;
  accuracy: number;
  dateStr: string;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, minSum: 2, maxSum: 4, timeSeconds: 15, title: 'Koki Pemula Gasing', kitchenBadge: 'Dapur Pagi Ceria' },
  { level: 2, minSum: 2, maxSum: 4, timeSeconds: 12, title: 'Peracik Adonan Dasar', kitchenBadge: 'Kompor Hangat' },
  { level: 3, minSum: 2, maxSum: 6, timeSeconds: 10, title: 'Penjaga Wajan Emas', kitchenBadge: 'Aroma Mentega' },
  { level: 4, minSum: 2, maxSum: 6, timeSeconds: 8, title: 'Ahli Pasangan Angka 6', kitchenBadge: 'Pesanan Ramai' },
  { level: 5, minSum: 2, maxSum: 8, timeSeconds: 6, title: 'Koki Cepat Tangkas', kitchenBadge: 'Api Kompor Biru' },
  { level: 6, minSum: 2, maxSum: 8, timeSeconds: 6, title: 'Spesialis Sirup Maple', kitchenBadge: 'Festival Sarapan' },
  { level: 7, minSum: 2, maxSum: 9, timeSeconds: 6, title: 'Kapten Dapur Gasing', kitchenBadge: 'Restoran Bintang Lima' },
  { level: 8, minSum: 2, maxSum: 9, timeSeconds: 6, title: 'Pendekar Spatula Perak', kitchenBadge: 'Tantangan Koki Utama' },
  { level: 9, minSum: 2, maxSum: 10, timeSeconds: 6, title: 'Grand Chef Penjumlahan 10', kitchenBadge: 'Turnamen Koki Aceh' },
  { level: 10, minSum: 2, maxSum: 10, timeSeconds: 6, title: 'Master Pancake Legendaris', kitchenBadge: 'Puncak Dapur Master' },
];

const PLATE_COLORS = [
  '#ef4444', // Merah Ceria
  '#3b82f6', // Biru Langit
  '#10b981', // Hijau Zamrud
  '#8b5cf6', // Ungu Anggur
  '#ec4899', // Merah Muda
  '#06b6d4', // Sian Segar
  '#f97316', // Oranye Jeruk
];

export function getLevelConfig(level: number): LevelConfig {
  const clamped = Math.max(1, Math.min(10, level));
  return LEVEL_CONFIGS[clamped - 1];
}

/**
 * Generates all valid positive integer pairs (a, b) with minSum <= a + b <= maxSum
 */
function getValidPairsForRange(minSum: number, maxSum: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let sum = minSum; sum <= maxSum; sum++) {
    for (let a = 1; a < sum; a++) {
      const b = sum - a;
      if (a >= 1 && b >= 1 && a + b <= 10) {
        pairs.push([a, b]);
      }
    }
  }
  return pairs;
}

/**
 * Builds 4 pancakes cooking on the skillet where ONLY the exact pair (numA, numB) sums to targetSum.
 * Guarantees there is NEVER a second confusing pair that also adds up to targetSum.
 */
function buildUniquePancakeChoices(numA: number, numB: number, targetSum: number): PancakeChoice[] {
  const values: number[] = [numA, numB];

  // Candidate pool of distractor numbers from 1 to 10
  const candidatePool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = candidatePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
  }

  for (const candidate of candidatePool) {
    if (values.length >= 4) break;
    if (candidate === numA || candidate === numB) continue;
    if (values.includes(candidate)) continue;

    // Ensure adding `candidate` does NOT create any second pair summing to `targetSum`
    const createsConflictingPair = values.some((existing) => existing + candidate === targetSum);
    if (!createsConflictingPair) {
      values.push(candidate);
    }
  }

  // Fallback if needed
  let highSafe = Math.max(targetSum, 6);
  while (values.length < 4) {
    if (
      highSafe !== numA &&
      highSafe !== numB &&
      !values.includes(highSafe) &&
      !values.some((v) => v + highSafe === targetSum)
    ) {
      values.push(highSafe);
    }
    highSafe++;
  }

  // Shuffle the 4 pancakes so their positions on the skillet are randomized
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  return values.map((val, idx) => ({
    id: `pancake-${idx}-${val}-${Math.random().toString(36).slice(2, 7)}`,
    value: val,
    plateColor: PLATE_COLORS[idx % PLATE_COLORS.length],
  }));
}

export function buildGasingExplanation(numA: number, numB: number, targetSum: number): string {
  if (numA === numB) {
    return `Metode GASING (Angka Kembar): ${numA} ditambah ${numB} adalah pasangan kembar yang menghasilkan ${targetSum}. Ingat: ${numA} + ${numB} = ${targetSum}!`;
  }
  const bigger = Math.max(numA, numB);
  const smaller = Math.min(numA, numB);
  return `Metode GASING: Simpan angka besar (${bigger}) di kepala, lalu tambahkan ${smaller} langkah lagi menjadi ${targetSum}. Jadi pasangan tepat adalah Pancake ${numA} dan Pancake ${numB} (${numA} + ${numB} = ${targetSum})!`;
}

/**
 * Generates a contextual Metode GASING strategy hint when the player selects a wrong pair,
 * teaching mental math ("simpan angka besar di kepala, hitung maju di jari") WITHOUT revealing the secret answer pair.
 */
export function buildContextualGasingTip(
  selectedA: number,
  selectedB: number,
  targetSum: number
): ContextualGasingTip {
  const bigger = Math.max(selectedA, selectedB);
  const smaller = Math.min(selectedA, selectedB);
  const selectedSum = selectedA + selectedB;
  const isTooHigh = selectedSum > targetSum;
  const diff = Math.abs(selectedSum - targetSum);

  const mentalMathStep =
    selectedA === selectedB
      ? `Angka kembar ${selectedA} + ${selectedB} = ${selectedSum} (Target: ${targetSum})`
      : `Simpan angka besar (${bigger}) di kepala + hitung maju ${smaller} di jari = ${selectedSum}`;

  let headline = '';
  let strategyAdvice = '';

  if (bigger >= targetSum) {
    headline = `Angka ${bigger} Sudah ≥ Target ${targetSum}!`;
    strategyAdvice = `Trik GASING: Karena targetnya ${targetSum}, kedua pancake harus lebih kecil dari ${targetSum}. Pilih 1 angka di bawah ${targetSum} untuk disimpan di kepala, lalu hitung maju sisanya!`;
  } else if (isTooHigh) {
    headline = `Kelebihan ${diff} Angka! (${selectedSum} > ${targetSum})`;
    strategyAdvice = `Trik GASING: Simpan angka besar di kepala, lalu kurangi ${diff} langkah (pilih pasangan angka yang lebih kecil) agar pas berhenti di ${targetSum}!`;
  } else {
    headline = `Kurang ${diff} Angka Lagi! (${selectedSum} < ${targetSum})`;
    strategyAdvice = `Trik GASING: Cari angka yang lebih besar (mendekati ${targetSum}) untuk disimpan di kepala, supaya kamu tinggal menghitung maju sedikit di jari menuju ${targetSum}!`;
  }

  return {
    id: `tip-${Date.now()}-${selectedA}-${selectedB}`,
    selectedA,
    selectedB,
    selectedSum,
    targetSum,
    status: isTooHigh ? 'too_high' : 'too_low',
    diff,
    headline,
    mentalMathStep,
    strategyAdvice,
  };
}

export function generateQuestionForLevel(
  level: number,
  questionNumber: number,
  previousSignature?: string
): MathQuestion {
  const config = getLevelConfig(level);
  const allPairs = getValidPairsForRange(config.minSum, config.maxSum);

  // Pick a random pair different from the immediate previous question if possible
  let chosenPair = allPairs[Math.floor(Math.random() * allPairs.length)];
  if (allPairs.length > 1 && previousSignature) {
    const filtered = allPairs.filter(([a, b]) => `${a}+${b}` !== previousSignature);
    if (filtered.length > 0) {
      chosenPair = filtered[Math.floor(Math.random() * filtered.length)];
    }
  }

  const [numA, numB] = chosenPair;
  const targetSum = numA + numB;
  const choices = buildUniquePancakeChoices(numA, numB, targetSum);

  return {
    id: `L${level}-Q${questionNumber}-${Date.now()}`,
    level,
    questionNumber,
    numA,
    numB,
    targetSum,
    timeLimitSeconds: config.timeSeconds,
    choices,
    gasingTip: buildGasingExplanation(numA, numB, targetSum),
  };
}

export type GameMode = 'adventure' | 'marathon';

export function generateMarathonQuestion(
  questionNumber: number,
  previousSignature?: string
): MathQuestion {
  // First 3 questions warm up with 2..6, then full 2..10 range
  const minSum = 2;
  const maxSum = questionNumber <= 3 ? 6 : 10;
  const allPairs = getValidPairsForRange(minSum, maxSum);

  let chosenPair = allPairs[Math.floor(Math.random() * allPairs.length)];
  if (allPairs.length > 1 && previousSignature) {
    const filtered = allPairs.filter(([a, b]) => `${a}+${b}` !== previousSignature);
    if (filtered.length > 0) {
      chosenPair = filtered[Math.floor(Math.random() * filtered.length)];
    }
  }

  const [numA, numB] = chosenPair;
  const targetSum = numA + numB;
  const choices = buildUniquePancakeChoices(numA, numB, targetSum);

  return {
    id: `MARATHON-Q${questionNumber}-${Date.now()}`,
    level: 1,
    questionNumber,
    numA,
    numB,
    targetSum,
    timeLimitSeconds: 60,
    choices,
    gasingTip: buildGasingExplanation(numA, numB, targetSum),
  };
}

const LEADERBOARD_STORAGE_KEY = 'pancake_master_sdn66_leaderboard_v1';
const MARATHON_LEADERBOARD_STORAGE_KEY = 'pancake_master_sdn66_marathon_leaderboard_v1';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Cut Meurah Nadia',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 2',
    score: 2850,
    highestLevel: 3,
    correctCount: 22,
    cookedPancakes: 44,
    burntCount: 1,
    accuracy: 96,
    dateStr: 'Hari ini',
  },
  {
    id: 'seed-2',
    playerName: 'Teuku Farhan Rizki',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 1',
    score: 2100,
    highestLevel: 2,
    correctCount: 16,
    cookedPancakes: 32,
    burntCount: 2,
    accuracy: 89,
    dateStr: 'Hari ini',
  },
  {
    id: 'seed-3',
    playerName: 'Siti Humaira Putri',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 3',
    score: 3600,
    highestLevel: 4,
    correctCount: 27,
    cookedPancakes: 54,
    burntCount: 2,
    accuracy: 93,
    dateStr: 'Kemarin',
  },
];

const INITIAL_MARATHON_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'm-seed-1',
    playerName: 'M. Alfatih Gasing',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 4',
    score: 2400,
    highestLevel: 1,
    correctCount: 16,
    cookedPancakes: 32,
    burntCount: 1,
    accuracy: 94,
    dateStr: 'Hari ini',
  },
  {
    id: 'm-seed-2',
    playerName: 'Cut Putri Keumala',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 3',
    score: 1950,
    highestLevel: 1,
    correctCount: 13,
    cookedPancakes: 26,
    burntCount: 1,
    accuracy: 93,
    dateStr: 'Hari ini',
  },
  {
    id: 'm-seed-3',
    playerName: 'Teuku Ryan Pratama',
    schoolName: 'SDN 66 Banda Aceh',
    gradeClass: 'Kelas 2',
    score: 1500,
    highestLevel: 1,
    correctCount: 10,
    cookedPancakes: 20,
    burntCount: 2,
    accuracy: 83,
    dateStr: 'Kemarin',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return INITIAL_LEADERBOARD;
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LEADERBOARD;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'dateStr'>
): LeaderboardEntry[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `entry-${Date.now()}`,
    dateStr: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
  return updated;
}

export function getMarathonLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return INITIAL_MARATHON_LEADERBOARD;
  try {
    const raw = window.localStorage.getItem(MARATHON_LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        MARATHON_LEADERBOARD_STORAGE_KEY,
        JSON.stringify(INITIAL_MARATHON_LEADERBOARD)
      );
      return INITIAL_MARATHON_LEADERBOARD;
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MARATHON_LEADERBOARD;
  } catch {
    return INITIAL_MARATHON_LEADERBOARD;
  }
}

export function saveMarathonLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'dateStr'>
): LeaderboardEntry[] {
  const current = getMarathonLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `m-entry-${Date.now()}`,
    dateStr: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
  try {
    window.localStorage.setItem(MARATHON_LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
  return updated;
}
