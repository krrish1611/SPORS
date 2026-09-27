import React from "react";

export const CyberMechaBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Master Base Ambient Lighting / Reactor Glow */}
      <div className="absolute inset-0 transition-colors duration-500">
        {/* Dark Mode: Exact circuit pattern and colors from user reference image (#07090c & #a1ba8a) */}
        <div className="hidden dark:block absolute inset-0 bg-[#07090c]">
          {/* Authentic full-bleed circuit architecture from uploaded reference */}
          <div
            className="absolute inset-0 w-full h-full opacity-65 bg-repeat pointer-events-none"
            style={{
              backgroundImage: "url('/cyber-circuits-dark-reference.png')",
              backgroundSize: "680px auto",
              backgroundPosition: "center top",
            }}
          />
          {/* Soft ambient glow matching reference pale cyber sage */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#a1ba8a]/12 via-[#a1ba8a]/4 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[650px] h-[500px] bg-[#a1ba8a]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[650px] h-[500px] bg-[#95ad7b]/5 blur-3xl pointer-events-none" />
        </div>

        {/* Light Mode Ambient Glow (100% Preserved: Crisp White with Soft Luminous Cyber Red Ambient) */}
        <div className="block dark:hidden absolute inset-0 bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-rose-500/7 via-red-500/3 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-red-400/4 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-rose-400/4 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* 2. Light Mode Diagonal Cyber Circuit Grid (Preserved intact for Light Mode) */}
      <div
        className="block dark:hidden absolute inset-0 w-full h-full opacity-22 transition-opacity duration-300"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.85) 75%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.85) 75%, black 100%)",
        }}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="mecha-circuit-pattern"
              width="320"
              height="320"
              patternUnits="userSpaceOnUse"
            >
              {/* Base micro grid dots */}
              <circle cx="20" cy="20" r="1.2" className="fill-red-400/30" />
              <circle cx="160" cy="20" r="1.2" className="fill-red-400/30" />
              <circle cx="300" cy="20" r="1.2" className="fill-red-400/30" />
              <circle cx="80" cy="160" r="1.2" className="fill-red-400/30" />
              <circle cx="240" cy="160" r="1.2" className="fill-red-400/30" />
              <circle cx="40" cy="300" r="1.2" className="fill-red-400/30" />
              <circle cx="200" cy="300" r="1.2" className="fill-red-400/30" />

              {/* Main 45-degree diagonal circuit traces */}
              <path
                d="M-40 40 L60 140 L120 140 L180 200 L260 200 L340 280"
                fill="none"
                strokeWidth="1.2"
                className="stroke-red-400/35"
              />
              <path
                d="M-20 20 L70 110 L130 110 L190 170 L270 170 L350 250"
                fill="none"
                strokeWidth="1"
                strokeDasharray="4 2"
                className="stroke-red-400/25"
              />

              {/* Parallel Bus Trace 2 */}
              <path
                d="M100 -20 L220 100 L220 160 L280 220 L360 220"
                fill="none"
                strokeWidth="1.4"
                className="stroke-rose-600/35"
              />
              <path
                d="M120 -20 L235 95 L235 155 L295 215 L360 215"
                fill="none"
                strokeWidth="0.8"
                className="stroke-red-400/25"
              />

              {/* Branching Jog Trace 3 */}
              <path
                d="M0 240 L80 160 L140 160 L200 100 L200 40 L240 0"
                fill="none"
                strokeWidth="1.2"
                className="stroke-red-400/35"
              />
              
              {/* Long Diagonal Highway */}
              <path
                d="M-40 180 L140 360"
                fill="none"
                strokeWidth="1.5"
                className="stroke-rose-600/30"
              />
              <path
                d="M200 -40 L380 140"
                fill="none"
                strokeWidth="1.2"
                className="stroke-red-400/30"
              />

              {/* Stepped Angular Interconnects */}
              <path
                d="M40 80 L60 80 L100 120 L100 180 L140 220 L180 220"
                fill="none"
                strokeWidth="1"
                className="stroke-red-400/30"
              />
              <path
                d="M180 80 L220 80 L260 120 L260 180"
                fill="none"
                strokeWidth="1"
                className="stroke-rose-600/30"
              />

              {/* Circuit Terminal Nodes & Pads */}
              <g className="fill-red-500/70">
                <circle cx="120" cy="140" r="2.2" />
                <circle cx="120" cy="140" r="4.5" fill="none" strokeWidth="0.8" className="stroke-red-400/50" />
                
                <circle cx="260" cy="200" r="2.2" />
                <circle cx="260" cy="200" r="4.5" fill="none" strokeWidth="0.8" className="stroke-red-400/50" />
                
                <circle cx="220" cy="160" r="2.8" className="fill-red-600" />
                <circle cx="220" cy="160" r="5" fill="none" strokeWidth="0.8" className="stroke-red-500/60" />

                <circle cx="80" cy="160" r="2.2" />
                <circle cx="200" cy="40" r="2.2" />
                <circle cx="100" cy="120" r="1.8" />
                <circle cx="260" cy="120" r="2.2" />
              </g>

              {/* Micro Tech Via Markers */}
              <rect x="58" y="138" width="3.5" height="3.5" className="fill-red-600/50" />
              <rect x="178" y="198" width="3.5" height="3.5" className="fill-red-600/50" />
              <rect x="218" y="98" width="3.5" height="3.5" className="fill-red-600/50" />
              <rect x="78" y="158" width="3.5" height="3.5" className="fill-red-600/50" />

              {/* Micro Tech Labels */}
              <text
                x="135"
                y="136"
                className="fill-red-600/40 text-[7px] font-mono tracking-widest font-semibold"
              >
                0x7F
              </text>
              <text
                x="275"
                y="196"
                className="fill-red-600/40 text-[7px] font-mono tracking-widest font-semibold"
              >
                RELAY
              </text>
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#mecha-circuit-pattern)" />
        </svg>
      </div>

      {/* 3. Central Content Readability Scrim / Veil */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Light Mode: bright airy white center veil */}
        <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.85)_55%,rgba(255,255,255,0.22)_100%)]" />
        {/* Dark Mode: subtle dark veil matching #07090c so content is 100% readable while circuits show through */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,rgba(7,9,12,0.85)_0%,rgba(7,9,12,0.65)_50%,rgba(7,9,12,0.15)_100%)]" />
      </div>

      {/* 4. Left Cyber Mecha Frame (Preserved in Light Mode: Titanium with Crimson Conduits) */}
      <div className="block dark:hidden absolute left-0 top-0 bottom-0 pointer-events-none z-[2] flex items-center h-full">
        <img
          src="/cyber-mecha-left-light.png?v=crimson-red"
          alt=""
          className="h-full w-auto max-w-[28vw] md:max-w-[25vw] lg:max-w-[22vw] object-contain object-left opacity-60 transition-opacity duration-300 drop-shadow-[0_0_14px_rgba(239,68,68,0.22)]"
        />
      </div>

      {/* 5. Right Cyber Mecha Frame (Preserved in Light Mode: Titanium with Crimson Conduits) */}
      <div className="block dark:hidden absolute right-0 top-0 bottom-0 pointer-events-none z-[2] flex items-center h-full">
        <img
          src="/cyber-mecha-right-light.png?v=crimson-red"
          alt=""
          className="h-full w-auto max-w-[28vw] md:max-w-[25vw] lg:max-w-[22vw] object-contain object-right opacity-60 transition-opacity duration-300 drop-shadow-[0_0_14px_rgba(239,68,68,0.22)]"
        />
      </div>

      {/* 6. Visor Trim Accents */}
      <div className="block dark:hidden absolute top-0 left-20 right-20 sm:left-32 sm:right-32 md:left-48 md:right-48 lg:left-64 lg:right-64 h-3 flex items-center justify-between pointer-events-none opacity-45 z-[2]">
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500/60 via-rose-400/30 to-red-500/60" />
      </div>

      <div className="block dark:hidden absolute bottom-0 left-20 right-20 sm:left-32 sm:right-32 md:left-48 md:right-48 lg:left-64 lg:right-64 h-3 flex items-center justify-between pointer-events-none opacity-45 z-[2]">
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500/60 via-rose-400/30 to-red-500/60" />
      </div>
    </div>
  );
};
