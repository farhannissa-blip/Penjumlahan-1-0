import React from 'react';

export type ChefMood =
  | 'happy'
  | 'ready'
  | 'flipping'
  | 'celebrating'
  | 'worried'
  | 'wrong'
  | 'burnt';

interface ChefCharacterProps {
  mood: ChefMood;
  speechText: string;
  playerName?: string;
}

export const ChefCharacter: React.FC<ChefCharacterProps> = ({
  mood,
  speechText,
}) => {
  const isSuccess = mood === 'flipping' || mood === 'celebrating';
  const isWrong = mood === 'wrong';
  const isBurnt = mood === 'burnt';
  const isWorried = mood === 'worried';

  const getBodyAnimationClass = () => {
    if (isSuccess) return 'animate-chef-celebrate';
    if (isWrong) return 'animate-shake';
    if (isWorried) return 'animate-chef-worried';
    if (isBurnt) return 'animate-chef-burnt';
    return 'animate-chef-idle';
  };

  const getMoodBadge = () => {
    if (isSuccess) {
      return {
        label: '✓ HEBAT! JAWABAN BENAR!',
        bg: 'bg-emerald-500 text-stone-950 border-emerald-200 ring-2 ring-emerald-300',
      };
    }
    if (isWrong) {
      return {
        label: '✗ SALAH! AYO PILIH LAGI!',
        bg: 'bg-rose-600 text-white border-rose-200 ring-2 ring-rose-400',
      };
    }
    if (mood === 'ready') {
      return {
        label: '★ TEPAT! TEKAN BALIK SEKARANG!',
        bg: 'bg-amber-400 text-stone-950 border-yellow-200 ring-2 ring-amber-300',
      };
    }
    if (isWorried) {
      return {
        label: '⚠ CEPAT! WAKTU HAMPIR HABIS!',
        bg: 'bg-orange-500 text-white border-orange-200',
      };
    }
    if (isBurnt) {
      return {
        label: '✗ WAKTU HABIS · PANCAKE GOSONG!',
        bg: 'bg-stone-900 text-rose-400 border-rose-500',
      };
    }
    return {
      label: 'KOKI SIAP MEMASAK',
      bg: 'bg-amber-500/95 text-stone-950 border-amber-200',
    };
  };

  const badge = getMoodBadge();

  return (
    <div className="relative flex flex-col items-center select-none w-full">
      {/* Live Reaction Banner / Speech Bubble above/beside Chef */}
      <div
        className={`mb-1 px-3.5 py-1 rounded-full border-2 font-display font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all duration-200 text-center max-w-xs sm:max-w-md truncate ${badge.bg}`}
        title={speechText}
      >
        {badge.label}
      </div>

      {/* 2.5D Chef Standing Behind Stove to Cook */}
      <div className="relative w-36 h-32 sm:w-44 sm:h-38 lg:w-52 lg:h-44 flex items-end justify-center">
        {/* Emotion Aura Glow Behind Chef */}
        <div
          className={`pointer-events-none absolute inset-x-4 top-2 bottom-0 rounded-full blur-xl transition-all duration-300 ${
            isSuccess
              ? 'bg-emerald-400/55 scale-115'
              : isWrong
              ? 'bg-rose-500/55 scale-110'
              : mood === 'ready'
              ? 'bg-amber-400/50 scale-110'
              : isWorried
              ? 'bg-orange-500/45 scale-105'
              : isBurnt
              ? 'bg-rose-900/50 scale-95'
              : 'bg-amber-300/25 scale-100'
          }`}
        />

        {/* Rising Smoke Cloud when Burnt */}
        {isBurnt && (
          <div className="pointer-events-none absolute -top-4 inset-x-0 flex justify-center z-30">
            <span className="w-6 h-6 rounded-full bg-stone-700/90 blur-[2px] animate-smoke-1" />
            <span className="w-8 h-8 rounded-full bg-stone-800/95 blur-[3px] animate-smoke-2 -ml-2" />
            <span className="w-6 h-6 rounded-full bg-stone-700/85 blur-[2px] animate-smoke-3 -ml-1" />
          </div>
        )}

        {/* Sparkling Stars when Celebrating/Winning */}
        {isSuccess && (
          <div className="pointer-events-none absolute -top-2 inset-x-2 flex justify-between z-30">
            <span className="text-yellow-300 text-xl sm:text-2xl animate-star-burst drop-shadow">
              ★
            </span>
            <span
              className="text-emerald-300 text-2xl sm:text-3xl animate-star-burst drop-shadow"
              style={{ animationDelay: '100ms' }}
            >
              ✦
            </span>
            <span
              className="text-amber-300 text-xl sm:text-2xl animate-star-burst drop-shadow"
              style={{ animationDelay: '200ms' }}
            >
              ★
            </span>
          </div>
        )}

        <svg
          viewBox="0 0 180 155"
          className={`w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.55)] overflow-visible transition-transform duration-300 ${getBodyAnimationClass()}`}
        >
          {/* Chef Torso / Shoulders Standing Behind the Stove */}
          <path
            d="M46 112 C46 104, 56 100, 90 100 C124 100, 134 104, 134 112 L144 154 L36 154 Z"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="3"
          />
          {/* White Chef Apron & Collar */}
          <path
            d="M60 104 L120 104 L126 154 L54 154 Z"
            fill={isBurnt ? '#d6d3d1' : '#ffffff'}
            stroke="#cbd5e1"
            strokeWidth="2.5"
          />
          {/* Red Neckcheif / Scarf */}
          <path
            d="M72 103 L90 118 L108 103 Z"
            fill="#b91c1c"
            stroke="#7f1d1d"
            strokeWidth="2"
          />
          <text
            x="90"
            y="136"
            textAnchor="middle"
            fill="#b91c1c"
            fontSize="11"
            fontWeight="800"
            fontFamily="Fredoka, sans-serif"
          >
            KOKI CILIK
          </text>

          {/* Left Arm Holding Stove / Celebrating / Shocked */}
          <g
            className="transition-transform duration-300 origin-[48px_116px]"
            style={{
              transform: isSuccess
                ? 'rotate(42deg) translate(-6px, -14px)'
                : isWrong || isWorried
                ? 'rotate(28deg) translate(-4px, -8px)'
                : 'rotate(0deg)',
            }}
          >
            <rect
              x="18"
              y="110"
              width="34"
              height="15"
              rx="7.5"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2.5"
            />
            {/* Left Hand */}
            <circle cx="18" cy="117" r="9" fill="#fed7aa" stroke="#c2410c" strokeWidth="2.5" />
          </g>

          {/* Chef Hat (Topi Koki Putih Tinggi 2.5D) */}
          <g
            className={`transition-transform duration-300 ${
              isSuccess
                ? '-translate-y-3 rotate-[-3deg]'
                : isWrong
                ? 'translate-y-1 rotate-[-5deg]'
                : isBurnt
                ? 'translate-y-2.5 rotate-[7deg]'
                : ''
            }`}
          >
            <path
              d="M52 52 C34 46, 32 20, 55 16 C62 2, 85 0, 92 10 C102 0, 124 4, 128 18 C146 22, 144 46, 128 52 Z"
              fill={isBurnt ? '#d6d3d1' : '#ffffff'}
              stroke={isBurnt ? '#57534e' : '#cbd5e1'}
              strokeWidth="3"
            />
            <path
              d="M56 44 C52 32, 62 22, 70 24 M90 42 L90 16 M120 44 C124 32, 116 22, 108 24"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {isBurnt && (
              <ellipse cx="104" cy="24" rx="11" ry="6" fill="#44403c" opacity="0.6" />
            )}
            {/* Hat Band */}
            <rect
              x="53"
              y="44"
              width="74"
              height="16"
              rx="5"
              fill="#f8fafc"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            <rect x="55" y="54" width="70" height="4.5" rx="2" fill="#dc2626" />
          </g>

          {/* Ears */}
          <circle cx="50" cy="80" r="9" fill="#fdba74" stroke="#c2410c" strokeWidth="2.5" />
          <circle cx="130" cy="80" r="9" fill="#fdba74" stroke="#c2410c" strokeWidth="2.5" />

          {/* Head / Face (Large & Expressive) */}
          <rect
            x="54"
            y="55"
            width="72"
            height="56"
            rx="28"
            fill={isBurnt ? '#e7e5e4' : '#fed7aa'}
            stroke="#c2410c"
            strokeWidth="2.8"
          />

          {/* Soot smudges on face when burnt */}
          {isBurnt && (
            <>
              <ellipse cx="68" cy="92" rx="8" ry="4.5" fill="#44403c" opacity="0.5" />
              <ellipse cx="112" cy="75" rx="7" ry="4" fill="#44403c" opacity="0.5" />
            </>
          )}

          {/* Hair Bangs */}
          <path
            d="M54 70 C60 55, 80 57, 88 64 C96 55, 118 57, 126 70 C118 60, 102 60, 92 66 C80 59, 62 61, 54 70 Z"
            fill="#292524"
          />

          {/* Rosy Cheeks */}
          <ellipse
            cx="66"
            cy="88"
            rx="6.5"
            ry="4"
            fill={isSuccess ? '#f43f5e' : '#fb7185'}
            opacity={isSuccess ? '0.85' : '0.55'}
          />
          <ellipse
            cx="114"
            cy="88"
            rx="6.5"
            ry="4"
            fill={isSuccess ? '#f43f5e' : '#fb7185'}
            opacity={isSuccess ? '0.85' : '0.55'}
          />

          {/* Animated Sweat Drops when Worried or Wrong Answer */}
          {(isWorried || isWrong) && (
            <g className="animate-chef-sweat">
              <path
                d="M122 65 C122 65, 128 73, 128 77 C128 80.5, 125 83, 122 83 C119 83, 116 80.5, 116 77 C116 73, 122 65, 122 65 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* =========================================================
              FACIAL EXPRESSIONS: EYES
             ========================================================= */}
          {isSuccess ? (
            /* Happy Laughing Eyes (^ ^) when Correct! */
            <>
              <path
                d="M66 79 Q73 68 80 79"
                fill="none"
                stroke="#1c1917"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M100 79 Q107 68 114 79"
                fill="none"
                stroke="#1c1917"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : isWrong ? (
            /* Shocked / Wincing Eyes (> <) when Wrong Answer! */
            <>
              <path
                d="M66 73 L78 78 L66 83"
                fill="none"
                stroke="#991b1b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M114 73 L102 78 L114 83"
                fill="none"
                stroke="#991b1b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : isBurnt ? (
            /* X_X Dizzy Eyes when Burnt */
            <>
              <path
                d="M67 73 L79 83 M79 73 L67 83"
                stroke="#1c1917"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M101 73 L113 83 M113 73 L101 83"
                stroke="#1c1917"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </>
          ) : isWorried ? (
            /* Wide Panicked Eyes when Time Low */
            <>
              <circle cx="73" cy="78" r="6" fill="#ffffff" stroke="#1c1917" strokeWidth="2.2" />
              <circle cx="73" cy="78" r="2.8" fill="#1c1917" />
              <circle cx="107" cy="78" r="6" fill="#ffffff" stroke="#1c1917" strokeWidth="2.2" />
              <circle cx="107" cy="78" r="2.8" fill="#1c1917" />
              <path d="M64 68 L80 72" stroke="#1c1917" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M116 68 L100 72" stroke="#1c1917" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            /* Cheerful Blinking Eyes when Cooking/Ready */
            <g className="animate-chef-blink">
              <circle cx="73" cy="78" r="5.5" fill="#1c1917" />
              <circle cx="75" cy="76" r="2" fill="#ffffff" />
              <circle cx="107" cy="78" r="5.5" fill="#1c1917" />
              <circle cx="109" cy="76" r="2" fill="#ffffff" />
            </g>
          )}

          {/* =========================================================
              FACIAL EXPRESSIONS: MOUTH
             ========================================================= */}
          {isSuccess ? (
            /* Huge Beaming Victory Laugh Mouth */
            <g>
              <path
                d="M73 89 Q90 109 107 89 Z"
                fill="#dc2626"
                stroke="#7f1d1d"
                strokeWidth="2.5"
              />
              <path d="M77 90 L103 90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isWrong ? (
            /* Wavy Grimace Mouth when Wrong Answer */
            <path
              d="M74 97 Q80 91 85 97 T96 97 T106 97"
              fill="none"
              stroke="#991b1b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : isBurnt ? (
            /* Sad Frown Mouth when Burnt */
            <path
              d="M76 100 Q90 88 104 100"
              fill="none"
              stroke="#991b1b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : isWorried ? (
            /* Surprised 'O' Mouth when Low Time */
            <ellipse
              cx="90"
              cy="95"
              rx="6.5"
              ry="5.5"
              fill="#991b1b"
              stroke="#450a0a"
              strokeWidth="2"
            />
          ) : (
            /* Warm Happy Cooking Smile */
            <path
              d="M77 90 Q90 103 103 90 Z"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2.2"
            />
          )}

          {/* Animated Right Arm + Stainless Kitchen Spatula Ready Over the Stove */}
          <g
            className={`origin-[130px_116px] ${
              isSuccess ? 'animate-spatula-flip' : 'transition-transform duration-300'
            }`}
            style={{
              transform:
                mood === 'ready'
                  ? 'rotate(-24deg) translateY(-6px)'
                  : isSuccess
                  ? 'rotate(-35deg) translateY(-12px)'
                  : isWrong
                  ? 'rotate(16deg) translateY(4px)'
                  : isBurnt
                  ? 'rotate(25deg) translateY(6px)'
                  : 'rotate(-8deg)',
            }}
          >
            {/* Right Arm */}
            <rect
              x="126"
              y="108"
              width="32"
              height="15"
              rx="7.5"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2.5"
            />
            {/* Right Hand */}
            <circle cx="158" cy="115" r="9" fill="#fed7aa" stroke="#c2410c" strokeWidth="2.5" />
            {/* Spatula Handle & Slotted Blade */}
            <rect x="154" y="76" width="7" height="36" rx="3.5" fill="#78350f" />
            <rect
              x="144"
              y="46"
              width="27"
              height="32"
              rx="5"
              fill="#e2e8f0"
              stroke="#475569"
              strokeWidth="2.5"
            />
            <line x1="151" y1="52" x2="151" y2="71" stroke="#475569" strokeWidth="2.2" />
            <line x1="157.5" y1="52" x2="157.5" y2="71" stroke="#475569" strokeWidth="2.2" />
            <line x1="164" y1="52" x2="164" y2="71" stroke="#475569" strokeWidth="2.2" />
          </g>
        </svg>
      </div>
    </div>
  );
};
