/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Award,
  BookOpen,
  ChefHat,
  Flame,
  Keyboard,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  generateQuestionForLevel,
  getLeaderboard,
   getLevelConfig,
  LeaderboardEntry,
  LEVEL_CONFIGS,
  MathQuestion,
  PancakeChoice,
  saveLeaderboardEntry,
} from './utils/mathGasing';
import { soundEngine } from './utils/sound';
import { KitchenStage } from './components/KitchenStage';
import { ChefMood } from './components/ChefCharacter';

type ScreenState = 'HOME' | 'PLAYING' | 'LEVEL_UP' | 'GAME_OVER';
type SkilletState = 'selecting' | 'ready_to_flip' | 'wrong_pair' | 'flipping' | 'golden' | 'burnt';

const QUICK_STUDENT_NAMES = [
  'Koki Cilik Aceh',
  'Teuku Ryan',
  'Cut Putri',
  'M. Alfatih',
  'Siti Aisyah',
  'Naufal Gasing',
];

const TOUCH_KEYBOARD_KEYS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', 'SPASI', 'HAPUS',
];

export default function App() {
  // Form & Player Profile State
  const [playerName, setPlayerName] = useState<string>('Koki Cilik');
  const [schoolName, setSchoolName] = useState<string>('SDN 66 Banda Aceh');
  const [gradeClass, setGradeClass] = useState<string>('Kelas 1');
  const [showTouchKeyboard, setShowTouchKeyboard] = useState<boolean>(false);

  // Navigation & Modal State
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Game State
  const [level, setLevel] = useState<number>(1);
  const [highestLevel, setHighestLevel] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState<number>(1); // 1 to 10 per level
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [cookedPancakes, setCookedPancakes] = useState<number>(0);
  const [burntCount, setBurntCount] = useState<number>(0);

  // Current Question & Skillet State
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion>(() =>
    generateQuestionForLevel(1, 1)
  );
  const [selectedPancakes, setSelectedPancakes] = useState<PancakeChoice[]>([]);
  const [skilletState, setSkilletState] = useState<SkilletState>('selecting');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [chefMood, setChefMood] = useState<ChefMood>('happy');
  const [chefSpeech, setChefSpeech] = useState<string>(
    'Ayo pilih 2 pancake yang sesuai dengan penjumlahan di atas wajan!'
  );

  const lastSignatureRef = useRef<string>('');
  const warningTickSecondRef = useRef<number>(-1);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.isMuted = next;
  };

  // Load a fresh question for given level & questionIndex
  const loadQuestion = useCallback((targetLevel: number, targetQIndex: number) => {
    const nextQ = generateQuestionForLevel(
      targetLevel,
      targetQIndex,
      lastSignatureRef.current
    );
    lastSignatureRef.current = `${nextQ.numA}+${nextQ.numB}`;
    setCurrentQuestion(nextQ);
    setSelectedPancakes([]);
    setSkilletState('selecting');
    setTimeLeft(nextQ.timeLimitSeconds);
    warningTickSecondRef.current = -1;
    setChefMood('happy');
    setChefSpeech(
      `Cari 2 pancake di piring yang jika dijumlahkan hasilnya ${nextQ.targetSum}, lalu tekan BALIK SEKARANG!`
    );
  }, []);

  // Start a new cooking adventure
  const handleStartGame = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = playerName.trim() || 'Koki Cilik';
    const cleanSchool = schoolName.trim() || 'SDN 66 Banda Aceh';
    setPlayerName(cleanName);
    setSchoolName(cleanSchool);

    setLevel(1);
    setHighestLevel(1);
    setQuestionIndex(1);
    setScore(0);
    setLives(3);
    setCorrectCount(0);
    setCookedPancakes(0);
    setBurntCount(0);

    loadQuestion(1, 1);
    setScreen('PLAYING');
    soundEngine.playReadyToFlipChime();
  };

  // Finish game & record to leaderboard
  const finishGame = useCallback(
    (
      finalScore: number,
      finalHighestLevel: number,
      finalCorrect: number,
      finalCooked: number,
      finalBurnt: number
    ) => {
      const totalAttempts = finalCorrect + finalBurnt;
      const accuracy =
        totalAttempts > 0 ? Math.round((finalCorrect / totalAttempts) * 100) : 0;

      const updated = saveLeaderboardEntry({
        playerName: playerName.trim() || 'Koki Cilik',
        schoolName: schoolName.trim() || 'SDN 66 Banda Aceh',
        gradeClass,
        score: finalScore,
        highestLevel: finalHighestLevel,
        correctCount: finalCorrect,
        cookedPancakes: finalCooked,
        burntCount: finalBurnt,
        accuracy,
      });
      setLeaderboard(updated);
      setScreen('GAME_OVER');
    },
    [playerName, schoolName, gradeClass]
  );

  // Triggered when cooking timer runs out
  const handleBurnTimeout = useCallback(() => {
    soundEngine.playCookingAlarmBurn();
    setSkilletState('burnt');
    setChefMood('burnt');
    setChefSpeech('Waduh, waktu habis dan pancakenya hangus! Ayo perhatikan penjelasan di layar.');
    setBurntCount((prev) => prev + 1);
    setLives((prev) => Math.max(0, prev - 1));
  }, []);

  // Countdown Timer Effect during active cooking
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    if (
      skilletState === 'flipping' ||
      skilletState === 'golden' ||
      skilletState === 'burnt'
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        const ratio = next / currentQuestion.timeLimitSeconds;

        // Play warning tick once per second when <= 35% time left
        if (ratio <= 0.35 && next > 0) {
          const wholeSec = Math.ceil(next);
          if (warningTickSecondRef.current !== wholeSec) {
            warningTickSecondRef.current = wholeSec;
            soundEngine.playTimerWarningTick();
            setChefMood('worried');
            setChefSpeech('Awas! Wajan mulai berasap, cepat pilih dan balik pancakenya!');
          }
        }

        if (next <= 0) {
          window.clearInterval(interval);
          handleBurnTimeout();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [screen, skilletState, currentQuestion.timeLimitSeconds, handleBurnTimeout]);

  // Advance to next question or next level
  const advanceToNextQuestion = useCallback(
    (currentLives: number, currentScore: number, currentCorrect: number, currentCooked: number, currentBurnt: number) => {
      if (currentLives <= 0) {
        finishGame(currentScore, highestLevel, currentCorrect, currentCooked, currentBurnt);
        return;
      }

      if (questionIndex < 10) {
        const nextQIdx = questionIndex + 1;
        setQuestionIndex(nextQIdx);
        loadQuestion(level, nextQIdx);
      } else {
        // Completed 10 questions in this level!
        if (level < 10) {
          soundEngine.playLevelUp();
          const nextLvl = level + 1;
          setLevel(nextLvl);
          setHighestLevel((prev) => Math.max(prev, nextLvl));
          setScreen('LEVEL_UP');
        } else {
          // Completed all 10 levels!
          soundEngine.playLevelUp();
          finishGame(currentScore, 10, currentCorrect, currentCooked, currentBurnt);
        }
      }
    },
    [questionIndex, level, highestLevel, loadQuestion, finishGame]
  );

  // Toggle selection of one of the 4 pancakes cooking on the skillet
  const handleTogglePancakeOnSkillet = (choice: PancakeChoice) => {
    if (
      skilletState === 'flipping' ||
      skilletState === 'golden' ||
      skilletState === 'burnt'
    ) {
      return;
    }

    // If tapping an already-selected pancake on the skillet, deselect it
    const alreadySelected = selectedPancakes.some((p) => p.id === choice.id);
    if (alreadySelected) {
      soundEngine.playRemovePancake();
      const filtered = selectedPancakes.filter((p) => p.id !== choice.id);
      setSelectedPancakes(filtered);
      setSkilletState('selecting');
      setChefMood('happy');
      setChefSpeech(
        `Silakan pilih pancake lainnya di atas wajan yang jumlahnya ${currentQuestion.targetSum}!`
      );
      return;
    }

    if (selectedPancakes.length >= 2) return;

    const updated = [...selectedPancakes, choice];
    setSelectedPancakes(updated);
    soundEngine.playSelectPancake(choice.value);

    if (updated.length === 1) {
      setSkilletState('selecting');
      setChefMood('happy');
      setChefSpeech(
        `Pancake ${choice.value} dipilih! Pilih 1 pancake lagi di wajan agar jumlahnya ${currentQuestion.targetSum}.`
      );
    } else if (updated.length === 2) {
      const sum = updated[0].value + updated[1].value;
      if (sum === currentQuestion.targetSum) {
        // Exact pair selected! Ready to flip!
        soundEngine.playReadyToFlipChime();
        setSkilletState('ready_to_flip');
        setChefMood('ready');
        setChefSpeech(
          'Pasangan tepat! Cepat ketuk tombol BALIK SEKARANG sebelum hangus!'
        );
      } else {
        // Wrong sum! Show distinct 'wrong' facial expression on Chef
        soundEngine.playWrongPairTryAgain();
        setSkilletState('wrong_pair');
        setChefMood('wrong');
        setChefSpeech(
          `Belum tepat! Jumlahnya belum ${currentQuestion.targetSum}. Ayo pilih ulang sebelum hangus!`
        );
        // Automatically clear wrong pair after 900ms so student can immediately re-pick
        window.setTimeout(() => {
          setSelectedPancakes((curr) =>
            curr.length === 2 && curr[0].value + curr[1].value !== currentQuestion.targetSum
              ? []
              : curr
          );
          setSkilletState((curr) => (curr === 'wrong_pair' ? 'selecting' : curr));
          setChefMood((curr) => (curr === 'wrong' ? 'happy' : curr));
        }, 900);
      }
    }
  };

  // Clear both selected pancakes on skillet
  const handleClearSkillet = () => {
    soundEngine.playRemovePancake();
    setSelectedPancakes([]);
    setSkilletState('selecting');
    setChefMood('happy');
    setChefSpeech(
      `Pilihan direset. Ayo pilih 2 dari 4 pancake di wajan yang hasilnya ${currentQuestion.targetSum}!`
    );
  };

  // Flip the pancakes!
  const handleFlipPancakes = () => {
    if (selectedPancakes.length < 2) return;
    const sum = selectedPancakes[0].value + selectedPancakes[1].value;

    if (sum === currentQuestion.targetSum) {
      // Correct! Flip animation -> Golden -> Award points
      setSkilletState('flipping');
      setChefMood('flipping');
      soundEngine.playFlipSuccess();

      const isFastBonus = timeLeft / currentQuestion.timeLimitSeconds >= 0.5;
      const earnedPoints = 100 + (isFastBonus ? 50 : 0);
      const nextScore = score + earnedPoints;
      const nextCorrect = correctCount + 1;
      const nextCooked = cookedPancakes + 2;

      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setCookedPancakes(nextCooked);
      setChefSpeech(
        `Hebat! Jawabanmu benar! ${selectedPancakes[0].value} + ${selectedPancakes[1].value} = ${sum}. (+${earnedPoints} Poin${isFastBonus ? ' Bonus Cepat!' : ''})`
      );

      // Settle to golden with butter & maple syrup after flip air animation
      window.setTimeout(() => {
        setSkilletState('golden');
        setChefMood('celebrating');
      }, 780);

      // Advance to next question after showing golden pancake celebration
      window.setTimeout(() => {
        advanceToNextQuestion(lives, nextScore, nextCorrect, nextCooked, burntCount);
      }, 2100);
    } else {
      // If they clicked flip while wrong pair was still on pan
      soundEngine.playWrongPairTryAgain();
      setSkilletState('wrong_pair');
      setChefMood('wrong');
      setChefSpeech(
        `Jumlahnya ${sum}, bukan ${currentQuestion.targetSum}! Ayo ganti pilihan pancakemu sebelum waktu habis!`
      );
      window.setTimeout(() => {
        setSelectedPancakes([]);
        setSkilletState('selecting');
        setChefMood((curr) => (curr === 'wrong' ? 'happy' : curr));
      }, 850);
    }
  };

  // Continue after burnt pancake explanation modal
  const handleNextAfterBurn = () => {
    advanceToNextQuestion(lives, score, correctCount, cookedPancakes, burntCount);
  };

  // Continue to next level from Level Up modal
  const handleStartNextLevel = () => {
    setQuestionIndex(1);
    loadQuestion(level, 1);
    setScreen('PLAYING');
  };

  // Touch keyboard handler for PID / Smart TV
  const handleTouchKey = (key: string) => {
    if (key === 'HAPUS') {
      setPlayerName((prev) => prev.slice(0, -1));
    } else if (key === 'SPASI') {
      setPlayerName((prev) => (prev.length < 24 ? `${prev} ` : prev));
    } else {
      setPlayerName((prev) => (prev.length < 24 ? `${prev}${key}` : prev));
    }
  };

  // Calculate final statistics for Game Over screen
  const totalQuestionsAttempted = correctCount + burntCount;
  const successPercentage =
    totalQuestionsAttempted > 0
      ? Math.round((correctCount / totalQuestionsAttempted) * 100)
      : 0;

  const getMotivationalMessage = () => {
    if (successPercentage >= 85) {
      return 'Hebat! Kamu semakin mahir menjumlahkan angka dengan Metode GASING. Terus berlatih menjadi Master Pancake kebanggaan SDN 66 Banda Aceh!';
    }
    if (successPercentage >= 60) {
      return 'Bagus sekali! Kamu sudah memahami pasangan penjumlahan dengan baik. Ayo main lagi agar gerakan membalik pancakemu semakin cepat!';
    }
    return 'Semangat terus Koki Cilik! Ingat rahasia Metode GASING: simpan angka besar di kepala, lalu tambahkan angka kecilnya. Ayo coba lagi!';
  };

  return (
    <div className="min-h-screen w-full bg-amber-50 text-stone-900 select-none">
      {/* =========================================================
          SCREEN 1: HALAMAN DEPAN (OPENING MENU)
         ========================================================= */}
      {screen === 'HOME' && (
        <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden">
          {/* Background Kitchen Illustration with Warm Scrim */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src="/src/assets/images/kitchen_backdrop_scene_1794101458966.jpg"
              alt="Latar Dapur Pancake Master"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/90 via-amber-900/80 to-stone-950/95" />
          </div>

          {/* Top Navigation Bar following 3-Zone Contract */}
          <header className="relative z-10 w-full border-b border-amber-500/30 bg-amber-950/80 backdrop-blur-xs px-4 sm:px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
              {/* Zone 1: Brand Title */}
              <div className="font-display font-bold text-lg sm:text-xl text-amber-300 tracking-wide whitespace-nowrap shrink-0">
                PANCAKE MASTER
              </div>

              {/* Zone 2: Nav Links */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-amber-100/90">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Panduan Bermain
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaderboardModal(true)}
                  className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Leaderboard
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'Suara Mati' : 'Suara Aktif'}</span>
                </button>
              </nav>

              {/* Zone 3: 1 Primary Action */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartGame()}
                  className="px-4 py-2 rounded-xl btn-25d-emerald text-stone-950 font-display font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Mulai Memasak
                </button>
              </div>
            </div>
          </header>

          {/* Main Hero Content: 2-Column Balanced Split */}
          <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
              {/* Left Column: Title, Subtitle, Hero Chef Illustration & Feature Highlights */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-amber-950/75 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-amber-50">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider mb-2">
                    PETUALANGAN PENJUMLAHAN METODE GASING
                  </div>
                  <h1
                    className="font-display font-bold text-amber-300 tracking-tight leading-none mb-2"
                    style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)', textWrap: 'balance' }}
                  >
                    PANCAKE MASTER
                  </h1>
                  <p className="text-base sm:text-lg font-extrabold text-white tracking-wide mb-4">
                    MEDIA PEMBELAJARAN SDN 66 BANDA ACEH
                  </p>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-6">
                    Jadilah Koki Cilik handal! Belajar penjumlahan hasil 2 sampai 10 dengan metode{' '}
                    <strong>GASING (Gampang, Asyik, dan Menyenangkan)</strong>. Pilih dua dari empat
                    pancake yang sedang dimasak di atas wajan panas dan balik sebelum hangus!
                  </p>
                </div>

                {/* Chef Mascot Hero Showcase */}
                <div className="relative rounded-2xl overflow-hidden border-3 border-amber-400 shadow-xl bg-amber-900/50 flex flex-col sm:flex-row items-center gap-4 p-4">
                  <img
                    src="/src/assets/images/chef_mascot_hero_1794101459654.jpg"
                    alt="Koki Cilik SDN 66 Banda Aceh sedang memasak pancake"
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border-2 border-amber-300 shrink-0 shadow-md"
                  />
                  <div className="space-y-2 text-left">
                    <div className="text-sm sm:text-base font-display font-bold text-amber-300">
                      Halo Teman-Teman SDN 66 Banda Aceh!
                    </div>
                    <p className="text-xs sm:text-sm text-amber-100 leading-snug">
                      &ldquo;Siapkan spatulamu! Ada <strong>10 Level Dapur</strong> dengan tantangan
                      memasak pancake keemasan, mentega meleleh, dan sirup maple yang lezat!&rdquo;
                    </p>
                    <div className="pt-1 text-xs font-semibold text-emerald-300">
                      10 Level Bertahap · 3 Nyawa Koki · Efek Suara Permainan
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Player Registration Form & Primary Action Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between card-25d-wood rounded-3xl p-6 sm:p-8 text-stone-900">
                <form onSubmit={handleStartGame} className="space-y-4">
                  <div className="border-b-2 border-amber-300 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">
                        Formulir Koki Cilik
                      </h2>
                      <p className="text-xs text-stone-700 font-medium">
                        Isi identitasmu sebelum masuk ke dapur restoran
                      </p>
                    </div>
                    <ChefHat className="w-9 h-9 text-amber-700 shrink-0" />
                  </div>

                  {/* Field 1: Nama Pemain */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="playerNameInput" className="text-xs sm:text-sm font-bold text-stone-800">
                        Nama Pemain
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTouchKeyboard(!showTouchKeyboard)}
                        className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer underline"
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>{showTouchKeyboard ? 'Tutup Papan Ketik Layar' : 'Papan Ketik Layar (PID/TV)'}</span>
                      </button>
                    </div>
                    <input
                      id="playerNameInput"
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Masukkan nama panggilanmu..."
                      maxLength={24}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-500 text-stone-900 font-bold text-base focus:outline-none focus:ring-4 focus:ring-amber-400"
                    />

                    {/* Quick Name Buttons for Touch TV / Classroom PID without Keyboard */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-600">Pilih Cepat:</span>
                      {QUICK_STUDENT_NAMES.map((sampleName) => (
                        <button
                          key={sampleName}
                          type="button"
                          onClick={() => setPlayerName(sampleName)}
                          className="px-2.5 py-1 rounded-lg bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {sampleName}
                        </button>
                      ))}
                    </div>

                    {/* Optional On-Screen Touch Keyboard for Smartboard/PID */}
                    {showTouchKeyboard && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 grid grid-cols-7 gap-1.5">
                        {TOUCH_KEYBOARD_KEYS.map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleTouchKey(key)}
                            className={`py-2 rounded-lg font-display font-bold text-xs shadow-xs cursor-pointer active:scale-95 ${
                              key === 'HAPUS'
                                ? 'col-span-2 bg-rose-500 text-white'
                                : key === 'SPASI'
                                ? 'col-span-2 bg-amber-500 text-stone-950'
                                : 'bg-white hover:bg-amber-200 text-stone-900 border border-amber-300'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Field 2: Nama Sekolah (Default: SDN 66 Banda Aceh) */}
                  <div>
                    <label htmlFor="schoolNameInput" className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      Nama Sekolah
                    </label>
                    <input
                      id="schoolNameInput"
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-500 text-stone-900 font-bold text-base focus:outline-none focus:ring-4 focus:ring-amber-400"
                    />
                  </div>

                  {/* Field 3: Pilihan Kelas 1 sampai 6 */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      Pilih Kelas (1 sampai 6)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map(
                        (kelas) => {
                          const isSelected = gradeClass === kelas;
                          return (
                            <button
                              key={kelas}
                              type="button"
                              onClick={() => setGradeClass(kelas)}
                              className={`py-2.5 px-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                                isSelected
                                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-900 scale-105'
                                  : 'bg-white hover:bg-amber-100 text-stone-800 border-2 border-amber-400'
                              }`}
                            >
                              {kelas}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Primary Action Buttons: MULAI MEMASAK, PANDUAN BERMAIN, LEADERBOARD */}
                  <div className="pt-3 space-y-3">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-2xl btn-25d-emerald text-stone-950 font-display font-bold text-xl tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-stone-950" />
                      <span>MULAI MEMASAK</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowGuideModal(true)}
                        className="py-3 px-4 rounded-2xl btn-25d-amber text-stone-950 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-5 h-5 shrink-0" />
                        <span>PANDUAN BERMAIN</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowLeaderboardModal(true)}
                        className="py-3 px-4 rounded-2xl btn-25d-amber text-stone-950 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <Trophy className="w-5 h-5 shrink-0" />
                        <span>LEADERBOARD</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 w-full py-3 px-4 text-center text-xs text-amber-200/80 border-t border-amber-500/20 bg-stone-950/80">
            Pancake Master · Media Pembelajaran Interaktif Metode GASING · SDN 66 Banda Aceh
          </footer>
        </div>
      )}

      {/* =========================================================
          SCREEN 2: ACTIVE GAMEPLAY (DAPUR PANCAKE MASTER)
         ========================================================= */}
      {screen === 'PLAYING' && (
        <KitchenStage
          playerName={playerName}
          schoolName={schoolName}
          gradeClass={gradeClass}
          level={level}
          questionIndex={questionIndex}
          score={score}
          lives={lives}
          correctCount={correctCount}
          burntCount={burntCount}
          question={currentQuestion}
          selectedPancakes={selectedPancakes}
          skilletState={skilletState}
          timeLeft={timeLeft}
          chefMood={chefMood}
          chefSpeech={chefSpeech}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onTogglePancakeOnSkillet={handleTogglePancakeOnSkillet}
          onClearSkillet={handleClearSkillet}
          onFlipPancakes={handleFlipPancakes}
          onNextAfterBurn={handleNextAfterBurn}
          onReturnHome={() => setScreen('HOME')}
        />
      )}

      {/* =========================================================
          SCREEN 3: LEVEL UP TRANSITION MODAL
         ========================================================= */}
      {screen === 'LEVEL_UP' && (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-stone-950">
          <div className="card-25d-wood max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center text-stone-900">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-9 h-9" />
            </div>
            <div className="text-xs font-extrabold text-amber-800 tracking-wider">
              SELAMAT! NAIK KE LEVEL BERIKUTNYA
            </div>
            <h2 className="text-3xl font-display font-bold text-stone-900 mt-1 mb-2">
              Level {level}: {getLevelConfig(level).title}
            </h2>
            <p className="text-sm text-stone-700 mb-5">
              Hebat sekali Koki <strong>{playerName}</strong>! Kamu telah menyelesaikan 10 pesanan di
              level sebelumnya. Sekarang api kompor semakin hangat dan tantangan memasak meningkat!
            </p>

            <div className="grid grid-cols-3 gap-3 bg-amber-100 border-2 border-amber-400 rounded-2xl p-4 mb-6 tabular-nums">
              <div>
                <div className="text-xs font-bold text-stone-600">Total Skor</div>
                <div className="text-xl font-display font-bold text-amber-900">{score}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-600">Target Jumlah</div>
                <div className="text-xl font-display font-bold text-emerald-800">
                  {getLevelConfig(level).minSum} – {getLevelConfig(level).maxSum}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-600">Waktu Masak</div>
                <div className="text-xl font-display font-bold text-rose-700">
                  {getLevelConfig(level).timeSeconds} dtk
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartNextLevel}
              className="w-full py-4 px-6 rounded-2xl btn-25d-emerald text-stone-950 font-display font-bold text-xl cursor-pointer"
            >
              MULAI LEVEL {level} SEKARANG!
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 4: HALAMAN AKHIR (GAME OVER / VICTORY SUMMARY)
         ========================================================= */}
      {screen === 'GAME_OVER' && (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-stone-950 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src="/src/assets/images/kitchen_backdrop_scene_1794101458966.jpg"
              alt="Dapur Restoran"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/90 to-stone-950/95" />
          </div>

          <div className="relative z-10 card-25d-wood max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-stone-900 my-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b-2 border-amber-300">
              <img
                src="/src/assets/images/chef_mascot_hero_1794101459654.jpg"
                alt="Koki Cilik"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border-3 border-amber-600 shadow-md shrink-0"
              />
              <div className="text-center sm:text-left">
                <div className="text-xs font-extrabold text-amber-800">
                  LAPORAN HASIL MEMASAK · {schoolName}
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                  Selesai Memasak, Koki {playerName}!
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-stone-700">
                  {gradeClass} · Gelar: {getLevelConfig(highestLevel).title}
                </p>
              </div>
            </div>

            {/* 6 Required End-Screen Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 tabular-nums">
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Total Skor</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-amber-700">
                  {score}
                </div>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Level Tertinggi</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                  Level {highestLevel}
                </div>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Jawaban Benar</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-700">
                  {correctCount} Soal
                </div>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Pancake Berhasil Dimasak</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-amber-600">
                  {cookedPancakes}
                </div>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Pancake Hangus</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-rose-600">
                  {burntCount}
                </div>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 text-center">
                <div className="text-xs font-bold text-stone-600">Persentase Keberhasilan</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-sky-700">
                  {successPercentage}%
                </div>
              </div>
            </div>

            {/* Motivational Message from Koki Cilik */}
            <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <Award className="w-7 h-7 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold text-amber-900 mb-0.5">
                  PESAN MOTIVASI KOKI CILIK:
                </div>
                <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-relaxed">
                  &ldquo;{getMotivationalMessage()}&rdquo;
                </p>
              </div>
            </div>

            {/* Required End Screen Buttons: MAIN LAGI & KEMBALI KE MENU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleStartGame()}
                className="py-4 px-6 rounded-2xl btn-25d-emerald text-stone-950 font-display font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>MAIN LAGI</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('HOME')}
                className="py-4 px-6 rounded-2xl btn-25d-amber text-stone-950 font-display font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChefHat className="w-5 h-5" />
                <span>KEMBALI KE MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: PANDUAN BERMAIN & METODE GASING
         ========================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-25d-wood max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-stone-900 my-8">
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-400 mb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-7 h-7 text-amber-800" />
                <h2 className="text-xl sm:text-2xl font-display font-bold">
                  Panduan Bermain &amp; Metode GASING
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-stone-900 cursor-pointer"
                aria-label="Tutup Panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4">
                <h3 className="font-display font-bold text-base text-amber-900 mb-1.5">
                  1. Apa itu Metode GASING?
                </h3>
                <p>
                  <strong>GASING (Gampang, Asyik, dan Menyenangkan)</strong> mengajarkan penjumlahan
                  melalui benda konkret (pancake dan titik visual) serta mengenal{' '}
                  <strong>pasangan bilangan</strong> hasil 2 sampai 10 dengan cepat tanpa menghafal
                  secara membosankan.
                </p>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4">
                <h3 className="font-display font-bold text-base text-amber-900 mb-2">
                  2. Langkah Memasak Pancake:
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 font-medium">
                  <li>Perhatikan soal penjumlahan di papan pesanan (contoh: <strong>BERAPA HASIL 3 + 4?</strong> dengan Target Jumlah <strong>7</strong>).</li>
                  <li>Ketuk <strong>Pancake angka pertama (3)</strong> dan <strong>Pancake angka kedua (4)</strong> dari piring warna-warni ke atas wajan.</li>
                  <li>Jika jumlah kedua pancake sudah benar, segera ketuk tombol <strong>BALIK SEKARANG!</strong> sebelum waktu habis.</li>
                  <li>Pancake akan terbalik di udara menjadi matang keemasan dengan lelehan mentega dan sirup maple!</li>
                </ol>
              </div>

              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4">
                <h3 className="font-display font-bold text-base text-amber-900 mb-2">
                  3. Aturan Skor, Waktu &amp; 10 Level Dapur:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Jawaban Benar: +100 Poin (+50 Bonus Cepat)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Pancake Hangus: Kehilangan 1 Nyawa (Total 3 Nyawa)</span>
                  </div>
                  <div>• Level 1–2: Penjumlahan hasil 2–4 (15s &amp; 12s)</div>
                  <div>• Level 3–4: Penjumlahan hasil 2–6 (10s &amp; 8s)</div>
                  <div>• Level 5–8: Penjumlahan hasil 2–9 (6 detik)</div>
                  <div>• Level 9–10: Penjumlahan hasil 2–10 (6 detik)</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-3.5 rounded-2xl btn-25d-emerald text-stone-950 font-display font-bold text-base cursor-pointer"
            >
              MENGERTI, AYO MULAI MEMASAK!
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: LEADERBOARD (PAPAN SKOR KOKI TERBAIK)
         ========================================================= */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-25d-wood max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-stone-900 my-8">
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-400 mb-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-amber-700" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold">
                    Leaderboard Master Pancake
                  </h2>
                  <p className="text-xs text-stone-600 font-semibold">
                    Daftar Koki Cilik Terbaik · SDN 66 Banda Aceh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboardModal(false)}
                className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-stone-900 cursor-pointer"
                aria-label="Tutup Leaderboard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto bg-white border-2 border-amber-400 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="bg-amber-200/80 text-amber-950 font-bold border-b border-amber-300">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Nama Koki</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Akurasi</th>
                    <th className="py-3 px-3 text-right">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-amber-50/80 font-medium">
                      <td className="py-2.5 px-3 font-display font-bold text-amber-900">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-stone-900">{entry.playerName}</div>
                        <div className="text-[11px] text-stone-500">{entry.schoolName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-700">{entry.gradeClass}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">
                        Lv.{entry.highestLevel}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-sky-800">{entry.accuracy}%</td>
                      <td className="py-2.5 px-3 text-right font-display font-bold text-base text-amber-800">
                        {entry.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setShowLeaderboardModal(false)}
              className="mt-5 w-full py-3.5 rounded-2xl btn-25d-amber text-stone-950 font-display font-bold text-base cursor-pointer"
            >
              TUTUP LEADERBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
