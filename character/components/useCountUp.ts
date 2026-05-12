"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  durationMs?: number;
};

export function useCountUp(value: number, opts: Options = {}) {
  const { durationMs = 650 } = opts;
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const p = easeOutCubic(t);
      setDisplay(Math.round(from + (to - from) * p));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    fromRef.current = to;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [durationMs, value]);

  return display;
}

