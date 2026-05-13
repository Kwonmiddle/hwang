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
    const clock = { last: 0, acc: 0 };

    const flushBurst = () => {
      clock.last = 0;
      clock.acc = 0;
    };

    const step = (now: number) => {
      if (!clock.last) clock.last = now;
      const rawDt = now - clock.last;
      clock.last = now;
      // 탭 백그라운드·절전 등으로 dt가 크게 벌어지면 누적 제거 (틱 폭주 방지)
      const gapSlipMs = Math.max(1000, frameMs * 8);
      if (rawDt > gapSlipMs) {
        clock.acc = 0;
      } else {
        clock.acc += rawDt;
      }
      if (clock.acc >= frameMs) {
        clock.acc -= frameMs;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        flushBurst();
      } else {
        flushBurst();
        if (!raf) raf = requestAnimationFrame(step);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(step);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
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

