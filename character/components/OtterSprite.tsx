"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Motion = 1 | 2 | 3;

type Props = {
  motion: Motion;
  /** base width in px */
  width: number;
  /** scale multiplier */
  scale?: number;
  /** frame interval ms */
  frameMs?: number;
  className?: string;
  ariaLabel?: string;
};

const SHEET_FRAMES = 5;
const JUMP_Y = -11;

function frameAtTick(motion: Motion, tick: number) {
  if (motion === 1) return [0, 1, 2, 1][tick % 4];
  if (motion === 2) return [1, 3, 1, 4][tick % 4];
  // motion 3: 7 ticks. up(0~4)=frame 5, down(5~6)=frame 2
  const p = tick % 7;
  return p < 5 ? 4 : 1;
}

function jumpYAtTick(tick: number) {
  const p = tick % 7;
  if (p < 5) return (JUMP_Y * p) / 4;
  return JUMP_Y + -JUMP_Y * (p - 5);
}

export function OtterSprite({
  motion,
  width,
  scale = 1,
  frameMs = 140,
  className = "",
  ariaLabel = "수달",
}: Props) {
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const height = useMemo(() => (width * 300) / 350, [width]);
  const pos = frameAtTick(motion, tick);

  useEffect(() => {
    let raf: number | null = null;
    let last = 0;
    let acc = 0;
    const step = (now: number) => {
      if (!last) last = now;
      const dt = now - last;
      last = now;
      acc += dt;
      if (acc >= frameMs) {
        acc -= frameMs;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [frameMs]);

  const translateY = motion === 3 ? jumpYAtTick(tick) : 0;

  return (
    <div
      className={`pixel-art select-none ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={{
        width,
        height,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: "center bottom",
        willChange: "transform",
      }}
    >
      <div
        ref={ref}
        className="pixel-art h-full w-full bg-no-repeat"
        style={{
          backgroundImage: "url(/char.png)",
          backgroundSize: `${width * SHEET_FRAMES}px ${height}px`,
          backgroundPosition: `${-pos * width}px 0px`,
        }}
      />
    </div>
  );
}

