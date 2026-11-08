import React from 'react';

export type PancakeCookState = 'choice' | 'cooking' | 'flipping' | 'golden' | 'burnt';

interface Pancake25DProps {
  value: number;
  state: PancakeCookState;
  plateColor?: string;
  heatRatio?: number; // 0 (fresh) to 1 (nearly burnt)
  isSelectedOnSkillet?: boolean;
  selectionOrder?: number; // 1 or 2 when selected on skillet
  onClick?: () => void;
  disabled?: boolean;
}

export const Pancake25D: React.FC<Pancake25DProps> = ({
  value,
  state,
  heatRatio = 0,
  isSelectedOnSkillet = false,
  selectionOrder,
  onClick,
  disabled = false,
}) => {
  const isWarningHeat = state === 'cooking' && heatRatio >= 0.65;

  // Determine 2.5D surface colors based on state and heat
  const getSurfaceGradient = () => {
    if (state === 'burnt') {
      return 'radial-gradient(circle at 38% 35%, #44403c 0%, #292524 55%, #1c1917 100%)';
    }
    if (state === 'golden' || state === 'flipping') {
      return 'radial-gradient(circle at 38% 35%, #f59e0b 0%, #d97706 62%, #92400e 100%)';
    }
    if (isWarningHeat) {
      return 'radial-gradient(circle at 38% 35%, #f59e0b 0%, #b45309 65%, #78350f 100%)';
    }
    // Fresh batter / normal cooking on skillet
    return 'radial-gradient(circle at 38% 35%, #fef08a 0%, #fcd34d 62%, #f59e0b 100%)';
  };

  const getCrustSideColor = () => {
    if (state === 'burnt') return '#0c0a09';
    if (state === 'golden' || state === 'flipping') return '#78350f';
    if (isWarningHeat) return '#92400e';
    return '#d97706';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelectedOnSkillet}
      aria-label={`Pancake angka ${value}${isSelectedOnSkillet ? ' dipilih' : ''}`}
      className={`group relative flex flex-col items-center justify-center focus:outline-none rounded-full transition-all duration-150 w-24 h-20 sm:w-32 sm:h-26 lg:w-36 lg:h-28 ${
        isSelectedOnSkillet && state === 'cooking'
          ? '-translate-y-2 scale-105 z-20 cursor-pointer'
          : !disabled
          ? 'cursor-pointer hover:-translate-y-1 active:translate-y-0.5'
          : 'cursor-default'
      }`}
    >
      {/* Dynamic Skillet Drop Shadow */}
      <div
        className={`absolute bottom-1 rounded-[50%] bg-black/55 blur-[2px] transition-all duration-150 w-22 h-15 sm:w-28 sm:h-20 lg:w-32 lg:h-22 ${
          state === 'flipping'
            ? 'animate-shadow-flip'
            : isSelectedOnSkillet
            ? 'scale-90 opacity-40 translate-y-2'
            : ''
        }`}
      />

      {/* Smoke Effects when nearly burnt or burnt */}
      {(state === 'burnt' || isWarningHeat) && (
        <div className="pointer-events-none absolute -top-6 inset-x-0 flex justify-center z-30">
          <span
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full animate-smoke-1 ${
              state === 'burnt' ? 'bg-stone-700/85' : 'bg-stone-400/60'
            } blur-[2px]`}
          />
          <span
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full animate-smoke-2 -ml-1.5 ${
              state === 'burnt' ? 'bg-stone-800/90' : 'bg-stone-300/65'
            } blur-[3px]`}
          />
          <span
            className={`w-4 h-4 rounded-full animate-smoke-3 -ml-1 ${
              state === 'burnt' ? 'bg-stone-600/85' : 'bg-stone-400/55'
            } blur-[2px]`}
          />
        </div>
      )}

      {/* Star Burst Effects when Golden Cooked */}
      {(state === 'golden' || state === 'flipping') && (
        <div className="pointer-events-none absolute -top-5 inset-x-0 flex justify-between px-1 z-30">
          <span className="text-amber-300 text-base sm:text-xl animate-star-burst drop-shadow">
            ★
          </span>
          <span
            className="text-yellow-200 text-lg sm:text-2xl animate-star-burst drop-shadow"
            style={{ animationDelay: '120ms' }}
          >
            ✦
          </span>
          <span
            className="text-amber-400 text-base sm:text-xl animate-star-burst drop-shadow"
            style={{ animationDelay: '220ms' }}
          >
            ★
          </span>
        </div>
      )}

      {/* Main 2.5D Pancake Body */}
      <div
        className={`relative flex items-center justify-center rounded-[50%] transition-all duration-200 w-22 h-17 sm:w-28 sm:h-22 lg:w-32 lg:h-25 ${
          state === 'flipping'
            ? 'animate-pancake-flip'
            : state === 'cooking'
            ? 'animate-pancake-sizzle'
            : ''
        } ${
          isSelectedOnSkillet
            ? 'ring-4 ring-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.85)]'
            : ''
        }`}
        style={{
          background: getSurfaceGradient(),
          boxShadow: `0 7px 0 ${getCrustSideColor()}, inset 0 3px 6px rgba(255, 255, 255, 0.45), inset 0 -4px 8px rgba(0, 0, 0, 0.25)`,
          border:
            state === 'burnt'
              ? '2px solid #1c1917'
              : isSelectedOnSkillet
              ? '3px solid #6ee7b7'
              : '2px solid #fef3c7',
        }}
      >
        {/* Inner Golden/Batter Ring Texture */}
        <div
          className="pointer-events-none absolute inset-1.5 rounded-[50%] border-2 border-dashed opacity-35"
          style={{
            borderColor: state === 'burnt' ? '#78716c' : state === 'golden' ? '#fef08a' : '#b45309',
          }}
        />

        {/* Air Bubbles on Batter */}
        <span
          className={`pointer-events-none absolute top-2 left-3.5 w-1.5 h-1.5 rounded-full ${
            state === 'burnt' ? 'bg-stone-950' : 'bg-amber-800/35'
          }`}
        />
        <span
          className={`pointer-events-none absolute bottom-2.5 right-3.5 w-2 h-1.5 rounded-full ${
            state === 'burnt' ? 'bg-stone-950' : 'bg-amber-800/35'
          }`}
        />

        {/* Maple Syrup Glossy Drizzle & Melting Butter on Golden Pancake */}
        {(state === 'golden' || state === 'flipping') && (
          <>
            {/* Maple Syrup Pool */}
            <div
              className="pointer-events-none absolute inset-1.5 rounded-[48%] opacity-85"
              style={{
                background:
                  'radial-gradient(circle at 45% 40%, rgba(180, 83, 9, 0.78) 0%, rgba(120, 53, 15, 0.88) 75%, transparent 100%)',
                boxShadow: 'inset 0 2px 4px rgba(254, 243, 199, 0.5)',
              }}
            />
            {/* Melting Butter Pat on Top-Left */}
            <div
              className="pointer-events-none absolute top-1 left-2.5 w-5 h-3.5 sm:w-6 sm:h-4 rotate-[-14deg] rounded-xs z-10"
              style={{
                background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
                boxShadow: '0 2px 0 #ca8a04, 0 0 8px rgba(254, 240, 138, 0.85)',
                border: '1px solid #fef08a',
              }}
            />
          </>
        )}

        {/* Number Label in Center */}
        <div
          className={`relative z-20 flex items-center justify-center rounded-full font-display font-bold tabular-nums leading-none shadow-md transition-transform w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 text-xl sm:text-2xl lg:text-3xl ${
            state === 'burnt'
              ? 'bg-stone-900/95 text-rose-400 border-2 border-rose-500/60'
              : state === 'golden' || state === 'flipping'
              ? 'bg-amber-950/95 text-amber-200 border-2 border-amber-300'
              : isSelectedOnSkillet
              ? 'bg-emerald-500 text-stone-950 border-2 border-white scale-110'
              : 'bg-white text-stone-900 border-2 border-amber-600'
          }`}
        >
          {value}
        </div>

        {/* Selection Badge (#1 / #2) on top-right when picked on skillet */}
        {isSelectedOnSkillet && selectionOrder && (
          <span className="absolute -top-2 -right-1 z-30 px-1.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 border border-white font-display font-bold text-[10px] sm:text-xs shadow">
            #{selectionOrder}
          </span>
        )}
      </div>
    </button>
  );
};
