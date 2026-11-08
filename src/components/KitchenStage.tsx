import React from 'react';
import {
  Flame,
  Heart,
  Home,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Timer,
  Utensils,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ContextualGasingTip,
  GameMode,
  MathQuestion,
  PancakeChoice,
  getLevelConfig,
} from '../utils/mathGasing';
import { Pancake25D, PancakeCookState } from './Pancake25D';
import { ChefCharacter, ChefMood } from './ChefCharacter';
import { FastBonusCelebration } from './FastBonusCelebration';

interface KitchenStageProps {
  gameMode: GameMode;
  playerName: string;
  schoolName: string;
  gradeClass: string;
  level: number;
  questionIndex: number; // 1..10 in adventure, 1..infinity in marathon
  score: number;
  lives: number;
  correctCount: number;
  burntCount: number;
  question: MathQuestion;
  selectedPancakes: PancakeChoice[];
  skilletState: 'selecting' | 'ready_to_flip' | 'wrong_pair' | 'flipping' | 'golden' | 'burnt';
  timeLeft: number;
  chefMood: ChefMood;
  chefSpeech: string;
  activeGasingTip: ContextualGasingTip | null;
  fastBonusTrigger: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePancakeOnSkillet: (choice: PancakeChoice) => void;
  onClearSkillet: () => void;
  onFlipPancakes: () => void;
  onDismissGasingTip: () => void;
  onNextAfterBurn: () => void;
  onReturnHome: () => void;
}

export const KitchenStage: React.FC<KitchenStageProps> = ({
  gameMode,
  playerName,
  schoolName,
  gradeClass,
  level,
  questionIndex,
  score,
  lives,
  correctCount,
  burntCount,
  question,
  selectedPancakes,
  skilletState,
  timeLeft,
  chefMood,
  chefSpeech,
  activeGasingTip,
  fastBonusTrigger,
  isMuted,
  onToggleMute,
  onTogglePancakeOnSkillet,
  onClearSkillet,
  onFlipPancakes,
  onDismissGasingTip,
  onNextAfterBurn,
  onReturnHome,
}) => {
  const isMarathon = gameMode === 'marathon';
  const levelConfig = getLevelConfig(level);
  const totalDuration = isMarathon ? 60 : question.timeLimitSeconds;
  const timeRatio = Math.max(0, Math.min(1, timeLeft / totalDuration));
  const heatRatio = 1 - timeRatio;
  const isCookingActive = skilletState !== 'golden' && skilletState !== 'flipping';
  const isLowTime = (timeRatio <= 0.3 && isCookingActive) || skilletState === 'burnt';
  const isMediumHeat = heatRatio >= 0.35 && isCookingActive;

  // Delay the explanation modal slightly when burnt so the player sees the red-blinking burnt pancakes on the wajan
  const [showBurnModal, setShowBurnModal] = React.useState(false);
  React.useEffect(() => {
    if (skilletState === 'burnt') {
      const timer = window.setTimeout(() => setShowBurnModal(true), 1150);
      return () => window.clearTimeout(timer);
    }
    setShowBurnModal(false);
  }, [skilletState]);

  // Dynamic CSS Variables for Skillet Smoke Plumes based on remaining time
  const effectiveSkilletHeat = skilletState === 'burnt' ? 1 : heatRatio;
  const skilletSmokeDuration = Math.max(0.42, 2.1 - effectiveSkilletHeat * 1.65).toFixed(2);
  const skilletSmokeOpacity = Math.min(0.92, 0.18 + effectiveSkilletHeat * 0.74).toFixed(2);
  const skilletSmokeScale = (1.15 + effectiveSkilletHeat * 1.45).toFixed(2);
  const skilletSmokeRiseY = `-${Math.round(48 + effectiveSkilletHeat * 56)}px`;
  const skilletPuffCount =
    skilletState === 'burnt' || effectiveSkilletHeat >= 0.75
      ? 7
      : effectiveSkilletHeat >= 0.5
      ? 5
      : 3;

  const getSkilletSmokeColor = () => {
    if (skilletState === 'burnt' || effectiveSkilletHeat >= 0.8) {
      return 'bg-stone-800/90 blur-md';
    }
    if (effectiveSkilletHeat >= 0.6) {
      return 'bg-stone-500/75 blur-md';
    }
    return 'bg-stone-300/55 blur-sm';
  };

  const currentSelectedSum =
    selectedPancakes.length === 2
      ? selectedPancakes[0].value + selectedPancakes[1].value
      : selectedPancakes.length === 1
      ? selectedPancakes[0].value
      : 0;

  const isPairCorrect =
    selectedPancakes.length === 2 && currentSelectedSum === question.targetSum;

  const getPancakeState = (isSelected: boolean): PancakeCookState => {
    if (skilletState === 'burnt') return 'burnt';
    if (isSelected && skilletState === 'flipping') return 'flipping';
    if (isSelected && skilletState === 'golden') return 'golden';
    return 'cooking';
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between relative overflow-hidden bg-stone-950 select-none">
      {/* Fast Bonus Fireworks & Confetti Celebration Overlay */}
      <FastBonusCelebration triggerKey={fastBonusTrigger} />

      {/* 2.5D Kitchen Backdrop Image with Warm Scrim */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/src/assets/images/kitchen_backdrop_scene_1794101458966.jpg"
          alt="Dapur Restoran Pancake Master"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/90 via-stone-900/80 to-stone-950/95" />
      </div>

      {/* Top HUD Bar (Compact for Portrait HP & Wide for Landscape PID) */}
      <header className="relative z-30 w-full shrink-0 bg-amber-950/90 border-b border-amber-600/60 px-3 sm:px-6 py-1.5 sm:py-2 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Player & School Info */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onReturnHome}
              className="p-1.5 sm:p-2 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-amber-100 border border-amber-500/50 transition-colors cursor-pointer shrink-0"
              title="Kembali ke Menu Utama"
              aria-label="Kembali ke Menu Utama"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-100 truncate">
                <span className="truncate">{playerName}</span>
                <span aria-hidden="true" className="text-amber-400">·</span>
                <span className="text-amber-300 shrink-0">{gradeClass}</span>
              </div>
              <div className="hidden sm:block text-[11px] text-amber-200/75 truncate">
                {schoolName} · {isMarathon ? 'Mode Maraton Memasak 60 Detik' : levelConfig.kitchenBadge}
              </div>
            </div>
          </div>

          {/* Center HUD Metrics: Mode/Level, Soal, Skor, Benar, Hangus */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-bold tabular-nums shrink-0">
            {isMarathon ? (
              <span className="text-rose-300 font-extrabold">MARATON 60s</span>
            ) : (
              <span className="text-amber-200">
                Lv.<strong className="text-amber-400">{level}</strong>
              </span>
            )}
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-amber-200">
              Soal <strong className="text-white">{isMarathon ? `#${questionIndex}` : `${questionIndex}/10`}</strong>
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-amber-200">
              Skor <strong className="text-amber-400">{score}</strong>
            </span>
            <span aria-hidden="true" className="hidden md:inline text-stone-500">·</span>
            <span className="hidden md:inline text-emerald-400">Benar: {correctCount}</span>
            {!isMarathon && (
              <>
                <span aria-hidden="true" className="hidden md:inline text-stone-500">·</span>
                <span className="hidden md:inline text-rose-400">Hangus: {burntCount}</span>
              </>
            )}
          </div>

          {/* Right HUD: Lives (Nyawa) or Marathon Badge & Audio Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isMarathon ? (
              <div
                className="flex items-center gap-1 bg-stone-900/90 border border-rose-500/50 rounded-xl px-2 py-1"
                aria-label={`Sisa nyawa ${lives} dari 3`}
              >
                {[1, 2, 3].map((heartIdx) => (
                  <Heart
                    key={heartIdx}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                      heartIdx <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-stone-600 fill-stone-800 scale-75'
                    }`}
                  />
                ))}
                <span className="ml-0.5 text-[11px] sm:text-xs font-bold text-rose-200 tabular-nums">
                  {lives}/3
                </span>
              </div>
            ) : (
              <div className="bg-stone-900/90 border border-amber-500/60 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-300 tabular-nums">
                ✓ {correctCount} Terjawab
              </div>
            )}

            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-amber-100 border border-amber-500/50 transition-colors cursor-pointer"
              aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =======================================================================
          MAIN STAGE: Adaptive Portrait (HP) & Landscape (PID / Smart TV) Layout
         ======================================================================= */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-3 flex flex-col lg:flex-row items-center justify-between lg:justify-center gap-1.5 sm:gap-4 lg:gap-10">
        {/* ZONE A: Giant Unboxed Question + Timer (Top in Portrait HP, Left Column in Landscape PID) */}
        <section className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
          <div className="text-[11px] sm:text-sm lg:text-base font-extrabold tracking-wider text-amber-300 uppercase drop-shadow">
            PILIH 2 PANCAKE YANG JUMLAHNYA:
          </div>

          {/* Giant Unboxed Equation Headline */}
          <h1
            className="font-display font-bold tracking-tight tabular-nums text-white leading-none select-none my-0.5 lg:my-2"
            style={{
              fontSize: 'clamp(2.5rem, 7.5vw, 5.25rem)',
              textShadow: '0 5px 0 #78350f, 0 8px 20px rgba(0,0,0,0.8)',
            }}
          >
            {selectedPancakes[0] ? (
              <span className="text-emerald-300">{selectedPancakes[0].value}</span>
            ) : (
              <span className="text-amber-200">?</span>
            )}{' '}
            +{' '}
            {selectedPancakes[1] ? (
              <span className="text-emerald-300">{selectedPancakes[1].value}</span>
            ) : (
              <span className="text-amber-200">?</span>
            )}{' '}
            = <span className="text-amber-400">{question.targetSum}</span>
          </h1>

          {/* Cooking Timer Bar */}
          <div className="w-full max-w-sm lg:max-w-md flex items-center gap-2 mt-1 lg:mt-3">
            <Timer
              className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                isLowTime ? 'text-rose-500 animate-bounce' : 'text-amber-300'
              }`}
            />
            <div className="flex-1 h-3 sm:h-4 bg-stone-800/95 rounded-full overflow-hidden border border-amber-500/40 shadow-inner">
              <div
                className={`h-full transition-all duration-100 rounded-full ${
                  isLowTime
                    ? 'bg-gradient-to-r from-rose-600 to-red-400'
                    : timeRatio <= 0.6
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-300'
                }`}
                style={{ width: `${Math.max(4, timeRatio * 100)}%` }}
              />
            </div>
            <span
              className={`text-xs sm:text-sm font-mono font-bold tabular-nums shrink-0 ${
                isLowTime ? 'text-rose-400 animate-pulse' : 'text-amber-200'
              }`}
            >
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          {/* Chef Instruction Text on Landscape PID */}
          <p className="hidden lg:block mt-4 text-sm xl:text-base font-semibold text-amber-100/90 leading-relaxed max-w-md">
            {chefSpeech}
          </p>

          {/* Desktop / Landscape PID Action Buttons (Hidden on Portrait Mobile, shown on lg+) */}
          <div className="hidden lg:flex items-center gap-3 w-full max-w-md mt-6">
            <button
              type="button"
              onClick={onFlipPancakes}
              disabled={
                selectedPancakes.length < 2 ||
                skilletState === 'flipping' ||
                skilletState === 'golden' ||
                skilletState === 'burnt'
              }
              className={`flex-1 py-4 px-6 rounded-2xl font-display font-bold text-xl tracking-wide flex items-center justify-center gap-2.5 cursor-pointer ${
                isPairCorrect && skilletState === 'ready_to_flip'
                  ? 'btn-25d-emerald text-stone-950 ring-4 ring-emerald-300/70 animate-bounce'
                  : selectedPancakes.length === 2
                  ? 'btn-25d-amber text-stone-950'
                  : 'bg-stone-800 text-stone-400 border-2 border-stone-700 cursor-not-allowed opacity-75'
              }`}
            >
              <Utensils className="w-6 h-6 shrink-0" />
              <span>BALIK SEKARANG!</span>
              {isPairCorrect && <Sparkles className="w-5 h-5 shrink-0" />}
            </button>

            {selectedPancakes.length > 0 &&
              skilletState !== 'flipping' &&
              skilletState !== 'golden' &&
              skilletState !== 'burnt' && (
                <button
                  type="button"
                  onClick={onClearSkillet}
                  className="py-4 px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-200 border-2 border-amber-500/50 font-bold text-base flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Batal</span>
                </button>
              )}
          </div>
        </section>

        {/* ZONE B: 2.5D Cooking Station — Chef Standing Behind Stove + 4-Pancake Wajan in Front */}
        <section className="w-full lg:w-7/12 flex flex-col items-center justify-center min-h-0">
          {/* 1. Chef Character Standing Directly Behind the Stove */}
          <div className="relative z-10 -mb-5 sm:-mb-6 lg:-mb-7">
            <ChefCharacter mood={chefMood} speechText={chefSpeech} playerName={playerName} />
          </div>

          {/* 2. Stove Counter + Cast-Iron Skillet (Wajan) in Front of Chef */}
          <div
            className={`relative z-20 flex flex-col items-center justify-center w-full ${
              skilletState === 'wrong_pair' || skilletState === 'burnt' ? 'animate-shake' : ''
            }`}
          >
            {/* Dynamic Progressive Smoke Plumes Rising from Skillet based on Remaining Time */}
            {(isMediumHeat || skilletState === 'burnt') && (
              <div
                className="pointer-events-none absolute -top-6 inset-x-0 flex justify-center items-center gap-3 sm:gap-5 z-30"
                style={
                  {
                    '--smoke-duration': `${skilletSmokeDuration}s`,
                    '--smoke-opacity': skilletSmokeOpacity,
                    '--smoke-scale': skilletSmokeScale,
                    '--smoke-rise-y': skilletSmokeRiseY,
                  } as React.CSSProperties
                }
              >
                {Array.from({ length: skilletPuffCount }).map((_, idx) => {
                  const delaySec = (
                    (Number(skilletSmokeDuration) / skilletPuffCount) *
                    idx
                  ).toFixed(2);
                  const driftX = idx % 2 === 0 ? '12px' : '-12px';
                  const puffSize =
                    effectiveSkilletHeat >= 0.75
                      ? 'w-9 h-9 sm:w-12 sm:h-12'
                      : effectiveSkilletHeat >= 0.55
                      ? 'w-7 h-7 sm:w-9 sm:h-9'
                      : 'w-5 h-5 sm:w-7 sm:h-7';
                  return (
                    <span
                      key={idx}
                      className={`rounded-full animate-dynamic-smoke ${puffSize} ${getSkilletSmokeColor()}`}
                      style={
                        {
                          animationDelay: `${delaySec}s`,
                          '--smoke-drift-x': driftX,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </div>
            )}

            {/* Cast-Iron Skillet (Wajan 2.5D dengan 4 Pancake di atasnya) */}
            <div
              className="relative w-full max-w-[310px] sm:max-w-[390px] lg:max-w-[440px] py-3.5 sm:py-5 px-5 sm:px-8 rounded-[48%] flex flex-col items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, #292524 0%, #1c1917 68%, #0c0a09 100%)',
                boxShadow: isLowTime
                  ? '0 12px 0 #0c0a09, 0 0 32px rgba(239, 68, 68, 0.6), inset 0 5px 16px rgba(249, 115, 22, 0.35)'
                  : '0 12px 0 #0c0a09, 0 18px 26px rgba(0, 0, 0, 0.7), inset 0 5px 14px rgba(255, 255, 255, 0.12)',
                border: isLowTime ? '5px solid #dc2626' : '5px solid #44403c',
              }}
            >
              {/* Skillet Side Handle */}
              <div
                className="pointer-events-none absolute -right-8 sm:-right-12 top-1/2 -translate-y-1/2 w-10 sm:w-14 h-5 sm:h-6 rounded-r-full bg-stone-800 border-2 border-stone-600 shadow-lg hidden sm:flex items-center justify-end pr-2"
                aria-hidden="true"
              >
                <span className="w-2 h-2 rounded-full bg-stone-950" />
              </div>

              {/* Inner Skillet Heat Ring */}
              <div
                className="pointer-events-none absolute inset-3 sm:inset-4 rounded-[46%] border-2 border-dashed transition-colors duration-300"
                style={{
                  borderColor: isLowTime
                    ? 'rgba(248, 113, 113, 0.55)'
                    : 'rgba(245, 158, 11, 0.28)',
                }}
              />

              {/* Melted Butter Sizzle Drops on Skillet */}
              <span className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-full bg-yellow-300/40 blur-[1px]" />
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-full bg-yellow-300/40 blur-[1px]" />

              {/* 4 Pancakes Already Cooking on the Skillet (2x2 Grid) */}
              <div className="relative z-10 grid grid-cols-2 gap-x-5 gap-y-1.5 sm:gap-x-9 sm:gap-y-2.5 place-items-center">
                {question.choices.slice(0, 4).map((choice) => {
                  const selectedIdx = selectedPancakes.findIndex((p) => p.id === choice.id);
                  const isSelected = selectedIdx !== -1;
                  return (
                    <Pancake25D
                      key={choice.id}
                      value={choice.value}
                      state={getPancakeState(isSelected)}
                      heatRatio={heatRatio}
                      isSelectedOnSkillet={isSelected}
                      selectionOrder={isSelected ? selectedIdx + 1 : undefined}
                      disabled={
                        skilletState === 'flipping' ||
                        skilletState === 'golden' ||
                        skilletState === 'burnt'
                      }
                      onClick={() => onTogglePancakeOnSkillet(choice)}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3. Stove Burner Grate & Animated Gas Flames Underneath Wajan */}
            <div className="relative flex flex-col items-center -mt-1.5 w-full max-w-[300px] sm:max-w-[360px]">
              <div className="flex items-center justify-center gap-2.5 z-10" aria-hidden="true">
                {Array.from({ length: Math.min(7, 3 + Math.floor(level / 2)) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-flame flex flex-col items-center"
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    <Flame
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        isLowTime
                          ? 'text-red-500 fill-orange-500'
                          : level >= 5
                          ? 'text-sky-400 fill-amber-400'
                          : 'text-orange-500 fill-yellow-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
              {/* Stove Top Metallic Rim */}
              <div className="w-4/5 h-2.5 rounded-full bg-gradient-to-r from-stone-800 via-stone-600 to-stone-800 border border-stone-500 shadow-md -mt-1" />
            </div>
          </div>
        </section>

        {/* ZONE C: Mobile / Portrait Action Button Row (Shown on < lg, hidden on lg+) */}
        <section className="w-full flex lg:hidden items-center justify-center gap-2.5 pb-1 shrink-0 max-w-md">
          <button
            type="button"
            onClick={onFlipPancakes}
            disabled={
              selectedPancakes.length < 2 ||
              skilletState === 'flipping' ||
              skilletState === 'golden' ||
              skilletState === 'burnt'
            }
            className={`flex-1 py-3 px-5 rounded-2xl font-display font-bold text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
              isPairCorrect && skilletState === 'ready_to_flip'
                ? 'btn-25d-emerald text-stone-950 ring-4 ring-emerald-300/70 animate-bounce'
                : selectedPancakes.length === 2
                ? 'btn-25d-amber text-stone-950'
                : 'bg-stone-800 text-stone-400 border-2 border-stone-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Utensils className="w-5 h-5 shrink-0" />
            <span>BALIK SEKARANG!</span>
            {isPairCorrect && <Sparkles className="w-4 h-4 shrink-0" />}
          </button>

          {selectedPancakes.length > 0 &&
            skilletState !== 'flipping' &&
            skilletState !== 'golden' &&
            skilletState !== 'burnt' && (
              <button
                type="button"
                onClick={onClearSkillet}
                className="py-3 px-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-200 border-2 border-amber-500/50 font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Batal</span>
              </button>
            )}
        </section>
      </main>

      {/* Contextual 'Tips Gasing' Corner Widget (Appears in corner when player selects a wrong pair) */}
      {activeGasingTip && skilletState !== 'burnt' && (
        <aside
          key={activeGasingTip.id}
          aria-live="polite"
          className="fixed bottom-16 right-2.5 left-2.5 sm:left-auto sm:bottom-4 sm:right-4 sm:w-[350px] lg:w-[375px] z-40 card-25d-wood rounded-2xl p-3 sm:p-4 text-stone-900 animate-gasing-tip"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 border-2 border-amber-700 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-200" />
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-amber-800 uppercase leading-none">
                  TIPS GASING · STRATEGI HITUNG CEPAT
                </div>
                <div className="text-xs sm:text-sm font-display font-bold text-rose-700 leading-tight mt-0.5">
                  {activeGasingTip.headline}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissGasingTip}
              className="p-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-stone-700 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup Tips Gasing"
              title="Tutup Tips"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Step 1: Mental Math Breakdown ("Simpan Angka Besar di Kepala") */}
          <div className="bg-amber-100/95 border border-amber-400 rounded-xl px-2.5 py-1.5 mb-1.5 text-[11px] sm:text-xs font-semibold text-stone-800">
            <div className="flex items-center justify-between gap-2 mb-0.5 font-mono font-bold tabular-nums">
              <span className="text-rose-700">
                Pilihanmu: {activeGasingTip.selectedA} + {activeGasingTip.selectedB} ={' '}
                {activeGasingTip.selectedSum}
              </span>
              <span className="text-emerald-800">Target: {activeGasingTip.targetSum}</span>
            </div>
            <div className="text-stone-700 leading-snug">
              {activeGasingTip.mentalMathStep}
            </div>
          </div>

          {/* Step 2: Actionable Strategy Advice without giving away the answer */}
          <p className="text-[11px] sm:text-xs font-bold text-amber-950 leading-snug">
            {activeGasingTip.strategyAdvice}
          </p>
        </aside>
      )}

      {/* Explanation Overlay when Pancake Burns (Shown after burnt red-blink animation plays) */}
      {showBurnModal && skilletState === 'burnt' && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-25d-wood max-w-md w-full rounded-3xl p-5 sm:p-6 text-stone-900">
            <div className="text-xs font-extrabold text-rose-700 mb-1">
              {isMarathon
                ? 'WAKTU MARATON 60 DETIK HABIS!'
                : 'WAKTU HABIS · PANCAKE HANGUS (-1 NYAWA)'}
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-2">
              {isMarathon
                ? `Hebat, Koki ${playerName}!`
                : `Jangan Menyerah, Koki ${playerName}!`}
            </h3>
            <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-3.5 sm:p-4 mb-4">
              <div className="text-xs font-bold text-amber-900 mb-1">
                PENJELASAN JAWABAN SOAL TERAKHIR:
              </div>
              <div className="text-xl font-display font-bold text-emerald-800 mb-1 tabular-nums">
                {question.numA} + {question.numB} = {question.targetSum}
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                {question.gasingTip}
              </p>
            </div>
            <button
              type="button"
              onClick={onNextAfterBurn}
              className="w-full py-3.5 px-6 rounded-2xl btn-25d-emerald text-stone-950 font-display font-bold text-base sm:text-lg cursor-pointer"
            >
              {isMarathon ? 'LIHAT HASIL MARATON 60 DETIK' : 'LANJUT MASAK SOAL BERIKUTNYA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
