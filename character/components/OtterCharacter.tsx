"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 스프라이트 시트: 가로 1750×300, 프레임 350×300 × 5 */
export const OTTER_SPRITE = {
  src: "/char.png",
  frameWidth: 350,
  frameHeight: 300,
  sheetWidth: 1750,
  sheetHeight: 300,
  frameCount: 5,
} as const;

type OtterCharacterProps = {
  className?: string;
  /** 자동으로 프레임을 순환 (기본: idle 루프) */
  autoPlay?: boolean;
  /** 한 프레임당 표시 시간 (ms) */
  frameIntervalMs?: number;
};

/** 노출 프레임만 1→2→3→2 (0-index 0,1,2,1) 반복 */
function idleOtterFrameIndex(tick: number): number {
  return [0, 1, 2, 1][tick % 4]!;
}

export function OtterCharacter({
  className = "",
  autoPlay = true,
  frameIntervalMs = 140,
}: OtterCharacterProps) {
  const { src, frameWidth, frameHeight, sheetWidth, sheetHeight } =
    OTTER_SPRITE;

  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const accRef = useRef(0);

  const frameIndex = idleOtterFrameIndex(tick);
  const bgX = -frameIndex * frameWidth;

  const step = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now;
    const dt = now - lastRef.current;
    lastRef.current = now;
    accRef.current += dt;
    if (accRef.current >= frameIntervalMs) {
      accRef.current -= frameIntervalMs;
      setTick((t) => t + 1);
    }
    rafRef.current = requestAnimationFrame(step);
  }, [frameIntervalMs]);

  useEffect(() => {
    if (!autoPlay) return;
    const onVis = () => {
      if (document.visibilityState === "hidden" && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastRef.current = 0;
      } else if (document.visibilityState === "visible" && !rafRef.current) {
        lastRef.current = 0;
        rafRef.current = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
  }, [autoPlay, step]);

  const bump = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return (
    <div
      className={`select-none ${className}`}
      role="img"
      aria-label="수달 캐릭터"
      onPointerDown={bump}
    >
      <div
        className="pixel-art relative overflow-hidden rounded-lg border border-white/10 bg-slate-800 shadow-lg"
        style={{
          width: frameWidth,
          height: frameHeight,
        }}
      >
        <div
          className="pixel-art absolute left-0 top-0"
          style={{
            width: frameWidth,
            height: frameHeight,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
            backgroundPosition: `${bgX}px 0`,
            imageRendering: "pixelated",
          }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        탭이 숨겨지면 애니메이션이 멈춥니다 · 캐릭터를 눌러 한 프레임 진행
      </p>
    </div>
  );
}
