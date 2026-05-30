"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Siswa Terdaftar", value: 500, suffix: "+", emoji: "👧" },
  { label: "Guru Aktif", value: 50, suffix: "+", emoji: "👩‍🏫" },
  { label: "Tahun Berdiri", value: 12, suffix: " Tahun", emoji: "🏫" },
  { label: "Laporan Harian", value: 10000, suffix: "+", emoji: "📝" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let frame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return count;
}

function StatCard({
  label,
  value,
  suffix,
  emoji,
  started,
}: {
  label: string;
  value: number;
  suffix: string;
  emoji: string;
  started: boolean;
}) {
  const count = useCountUp(value, 2000, started);

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <span className="text-3xl">{emoji}</span>
      <p className="text-3xl font-extrabold tabular-nums text-primary md:text-4xl">
        {count.toLocaleString("id-ID")}
        {suffix}
      </p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="rounded-[2rem] border bg-card p-8 shadow-sm md:p-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} started={started} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
