import React from 'react';

export type PancakeCookState = 'choice' | 'cooking' | 'flipping' | 'golden' | 'burnt';

interface Pancake25DProps {
  value: number;
  state: PancakeCookState;
  plateColor?: string;
  heatRatio?: number; // 0 (fresh, 100% time left) to 1 (0% time left, burnt)
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
  const clampedHeat = Math.max(0, Math.min(1, heatRatio));
  const isSmoking = state === 'burnt' || (state === 'cooking' && clampedHeat >= 0.3);
  const isCriticalHeat = state === 'cooking' && clampedHeat >= 0.75;
  const isWarningHeat = state === 'cooking' && clampedHeat >= 0.5;

  // Dynamic CSS Variables for Smoke Intensity & Speed based on remaining cooking time
  const effectiveHeat = state === 'burnt' ? 1 : clampedHeat;
  const smokeDurationSec = Math.max(0.45, 1.95 - effectiveHeat * 1.5).toFixed(2);
  const smokeOpacity = Math.min(0.94, 0.22 + effectiveHeat * 0.72).toFixed(2);
  const smokeScale = (1.05 + effectiveHeat * 1.3).toFixed(2);
  const smokeRiseY = `-${Math.round(38 + effectiveHeat * 40)}px`;

  const getSmokeColorClass = () => {
    if (state === 'burnt' || effectiveHeat >= 0.8) {
      return 'bg-stone-800/90 blur-[2.5px]';
    }
    if (effectiveHeat >= 0.6) {
      return 'bg-stone-600/80 blur-[2px]';
    }
    if (effectiveHeat >= 0.45) {
      return 'bg-stone-400/70 blur-[2px]';
    }
    return 'bg-stone-200/55 blur-[1.5px]';
  };

  // Smooth continuous HSL color darkening as heatRatio goes from 0 (fresh batter) to 1 (charred)
  const getSurfaceGradient = () => {
    if (state === 'burnt') {
      return 'radial-gradient(circle at 38% 35%, #292524 0%, #1c1917 58%, #0c0a09 100%)';
    }
    if (state === 'golden' || state === 'flipping') {
      return 'radial-gradient(circle at 38% 35%, #f59e0b 0%, #d97706 62%, #92400e 100%)';
    }
    // Progressive interpolation from golden-yellow (heat=0) -> deep scorched brown (heat=1)
    const hCenter = Math.round(48 - clampedHeat * 22); // 48deg -> 26deg
    const sCenter = Math.round(96 - clampedHeat * 45); // 96% -> 51%
    const lCenter = Math.round(76 - Math.pow(clampedHeat, 1.35) * 58); // 76% -> 18%

    const hMid = Math.round(42 - clampedHeat * 20);
    const sMid = Math.round(92 - clampedHeat * 48);
    const lMid = Math.round(62 - Math.pow(clampedHeat, 1.35) * 48); // 62% -> 14%

    const hEdge = Math.round(34 - clampedHeat * 18);
    const sEdge = Math.round(90 - clampedHeat * 55);
    const lEdge = Math.round(46 - Math.pow(clampedHeat, 1.3) * 38); // 46% -> 8%

    return `radial-gradient(circle at 38% 35%, hsl(${hCenter}, ${sCenter}%, ${lCenter}%) 0%, hsl(${hMid}, ${sMid}%, ${lMid}%) 62%, hsl(${hEdge}, ${sEdge}%, ${lEdge}%) 100%)`;
  };

  const getCrustSideColor = () => {
    if (state === 'burnt') return '#0c0a09';
    if (state === 'golden' || state === 'flipping') return '#78350f';
    const lSide = Math.round(40 - Math.pow(clampedHeat, 1.25) * 34); // 40% -> 6%
    return `hsl(28, 80%, ${lSide}%)`;
  };

  const puffCount = state === 'burnt' || effectiveHeat >= 0.75 ? 5 : effectiveHeat >= 0.5 ? 3 : 2;
  const smokeColorClass = getSmokeColorClass();

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

      {/* Dynamic Progressive Smoke Plumes on Pancake */}
      {isSmoking && (
        <div
          className="pointer-events-none absolute -top-5 inset-x-0 flex justify-center items-center z-30"
          style={
            {
              '--smoke-duration': `${smokeDurationSec}s`,
              '--smoke-opacity': smokeOpacity,
              '--smoke-scale': smokeScale,
              '--smoke-rise-y': smokeRiseY,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: puffCount }).map((_, idx) => {
            const delaySec = ((Number(smokeDurationSec) / puffCount) * idx).toFixed(2);
            const driftX = idx % 2 === 0 ? '7px' : '-7px';
            const sizeClass =
              effectiveHeat >= 0.75
                ? 'w-5 h-5 sm:w-7 sm:h-7'
                : effectiveHeat >= 0.5
                ? 'w-4 h-4 sm:w-5.5 sm:h-5.5'
                : 'w-3.5 h-3.5 sm:w-4 sm:h-4';
            return (
              <span
                key={idx}
                className={`rounded-full animate-dynamic-smoke -mx-1 ${sizeClass} ${smokeColorClass}`}
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
        className={`relative flex items-center justify-center rounded-[50%] transition-colors duration-200 w-22 h-17 sm:w-28 sm:h-22 lg:w-32 lg:h-25 overflow-hidden ${
          state === 'burnt'
            ? 'animate-pancake-burnt'
            : state === 'flipping'
            ? 'animate-pancake-flip'
            : state === 'cooking'
            ? 'animate-pancake-sizzle'
            : ''
        } ${
          isSelectedOnSkillet && state !== 'burnt'
            ? 'ring-4 ring-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.85)]'
            : ''
        }`}
        style={{
          background: getSurfaceGradient(),
          boxShadow: `0 7px 0 ${getCrustSideColor()}, inset 0 3px 6px rgba(255, 255, 255, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.35)`,
          border:
            state === 'burnt'
              ? '3px solid #ef4444'
              : isSelectedOnSkillet
              ? '3px solid #6ee7b7'
              : isCriticalHeat
              ? '2px solid #ef4444'
              : isWarningHeat
              ? '2px solid #f97316'
              : '2px solid #fef3c7',
        }}
      >
        {/* Red Blinking Danger Overlay when Burnt or Critical */}
        {(state === 'burnt' || isCriticalHeat) && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-[50%] ${
              state === 'burnt'
                ? 'bg-red-600/45 animate-red-danger-flash'
                : 'bg-red-500/20 animate-pulse'
            }`}
          />
        )}

        {/* Glowing Red Ember Cracks & Char Spots when Burnt */}
        {state === 'burnt' && (
          <svg
            viewBox="0 0 100 80"
            className="pointer-events-none absolute inset-0 w-full h-full opacity-90"
          >
            <path
              d="M18 22 L32 34 L25 48 M78 20 L64 32 L72 52 M35 64 L50 54 L66 66"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-red-danger-flash"
            />
            <ellipse cx="26" cy="28" rx="8" ry="5" fill="#09090b" opacity="0.75" />
            <ellipse cx="74" cy="54" rx="9" ry="5.5" fill="#09090b" opacity="0.75" />
          </svg>
        )}

        {/* Inner Golden/Batter Ring Texture */}
        <div
          className="pointer-events-none absolute inset-1.5 rounded-[50%] border-2 border-dashed opacity-35"
          style={{
            borderColor: state === 'burnt' ? '#ef4444' : state === 'golden' ? '#fef08a' : '#b45309',
          }}
        />

        {/* Air Bubbles on Batter */}
        <span
          className={`pointer-events-none absolute top-2 left-3.5 w-1.5 h-1.5 rounded-full ${
            state === 'burnt' || isCriticalHeat ? 'bg-stone-950' : 'bg-amber-800/35'
          }`}
        />
        <span
          className={`pointer-events-none absolute bottom-2.5 right-3.5 w-2 h-1.5 rounded-full ${
            state === 'burnt' || isCriticalHeat ? 'bg-stone-950' : 'bg-amber-800/35'
          }`}
        />

        {/* Maple Syrup Glossy Drizzle & Melting Butter on Golden Pancake */}
        {(state === 'golden' || state === 'flipping') && (
          <>
            <div
              className="pointer-events-none absolute inset-1.5 rounded-[48%] opacity-85"
              style={{
                background:
                  'radial-gradient(circle at 45% 40%, rgba(180, 83, 9, 0.78) 0%, rgba(120, 53, 15, 0.88) 75%, transparent 100%)',
                boxShadow: 'inset 0 2px 4px rgba(254, 243, 199, 0.5)',
              }}
            />
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
              ? 'bg-red-950/95 text-rose-200 border-2 border-red-500 animate-pulse'
              : state === 'golden' || state === 'flipping'
              ? 'bg-amber-950/95 text-amber-200 border-2 border-amber-300'
              : isSelectedOnSkillet
              ? 'bg-emerald-500 text-stone-950 border-2 border-white scale-110'
              : 'bg-white text-stone-900 border-2 border-amber-600'
          }`}
        >
          {value}
        </div>
      </div>

      {/* Selection Badge (#1 / #2) on top-right when picked on skillet */}
      {isSelectedOnSkillet && selectionOrder && state !== 'burnt' && (
        <span className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 border border-white font-display font-bold text-[10px] sm:text-xs shadow">
          #{selectionOrder}
        </span>
      )}

      {/* Burnt Red Warning Badge */}
      {state === 'burnt' && (
        <span className="absolute -top-1.5 -right-1 z-30 px-1.5 py-0.5 rounded-full bg-red-600 text-white border border-red-200 font-display font-bold text-[9px] sm:text-[10px] shadow animate-bounce">
          GOSONG!
        </span>
      )}
    </button>
  );
};
