import { useEffect, useRef, useState } from "react";

// Floating particle
function Particle({ style }) {
  return (
    <div className="pointer-events-none absolute rounded-full" style={style} />
  );
}

export default function Dashboard() {
  const [dots, setDots] = useState([]);
  const canvasRef = useRef(null);

  // Generate random floating orbs once
  useEffect(() => {
    setDots(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        width: Math.random() * 6 + 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.25 + 0.05,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        color: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#06b6d4" : "#6366f1",
      })),
    );
  }, []);

  return (
    <div className="relative flex h-screen flex-1 flex-col items-center justify-center bg-[#0d1e35] py-5 pb-64">
      {/* ── Grid lines bg ─────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Glow blobs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -right-32 -bottom-32 h-80 w-80 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse 8s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "pulse 10s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* ── Floating dots ──────────────────────────────────────── */}
      {dots.map((d) => (
        <Particle
          key={d.id}
          style={{
            width: d.width,
            height: d.width,
            top: `${d.top}%`,
            left: `${d.left}%`,
            opacity: d.opacity,
            background: d.color,
            boxShadow: `0 0 ${d.width * 2}px ${d.color}`,
            animation: `float ${d.duration}s ease-in-out infinite ${d.delay}s`,
          }}
        />
      ))}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Icon */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10"
          style={{
            boxShadow:
              "0 0 40px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            animation: "float 4s ease-in-out infinite",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-400"
          >
            <path
              d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "draw 3s ease-in-out infinite" }}
            />
          </svg>
        </div>

        {/* Badge */}
        <div
          className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5"
          style={{ animation: "fadeIn 0.6s ease both" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <span className="text-xs font-semibold tracking-widest text-amber-300 uppercase">
            Ishlab chiqilmoqda
          </span>
        </div>

        {/* Heading */}
        <div style={{ animation: "fadeInUp 0.7s ease 0.1s both" }}>
          <h1
            className="text-5xl font-black tracking-tight text-white sm:text-6xl"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              textShadow: "0 0 60px rgba(59,130,246,0.3)",
            }}
          >
            Tez Kunda
          </h1>
          <p
            className="mt-4 max-w-md text-base leading-relaxed text-gray-400"
            style={{ fontFamily: "system-ui" }}
          >
            Dashboard sahifasi hozirda tayyorlanmoqda. Tez orada to'liq
            statistika, grafiklar va hisobotlar bilan ishga tushadi.
          </p>
        </div>

        {/* Features preview cards */}
        <div
          className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3"
          style={{ animation: "fadeInUp 0.7s ease 0.25s both" }}
        >
          {[
            { icon: "📊", label: "Statistika" },
            { icon: "📈", label: "Grafiklar" },
            { icon: "🎯", label: "Hisobotlar" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white px-5 py-3"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <span className="text-xl opacity-60">{f.icon}</span>
              <span className="text-sm font-medium text-gray-500">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CSS animations ─────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1);    opacity: 0.2; }
          50%       { transform: scale(1.15); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
