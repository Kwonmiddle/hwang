"use client";

import { useCallback, useEffect, useRef } from "react";

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  return !!target.closest(
    "button, a, input, textarea, select, label, [role='button'], [contenteditable='true']",
  );
}

type Options = {
  /** 좌우로 이 정도(px) 이상 움직여야 슬라이드 전환 */
  thresholdPx?: number;
  /** 수평이 수직보다 이 배수 이상 커야 인정 (세로 스크롤 오인 방지) */
  horizontalRatio?: number;
};

/**
 * 터치·마우스(포인터) 좌우 스와이프로 이전/다음 콜백 호출.
 * 버튼·링크·폼 위에서는 동작하지 않습니다.
 */
export function useSwipeSlideChange(
  onSwipeTowardNext: () => void,
  onSwipeTowardPrev: () => void,
  { thresholdPx = 56, horizontalRatio = 1.25 }: Options = {},
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const activePointerId = useRef<number | null>(null);

  const onNext = useCallback(() => {
    onSwipeTowardNext();
  }, [onSwipeTowardNext]);

  const onPrev = useCallback(() => {
    onSwipeTowardPrev();
  }, [onSwipeTowardPrev]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;
      activePointerId.current = e.pointerId;
      startX.current = e.clientX;
      startY.current = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    const finish = (e: PointerEvent) => {
      if (activePointerId.current !== e.pointerId) return;
      activePointerId.current = null;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dx) < thresholdPx) return;
      if (Math.abs(dx) < Math.abs(dy) * horizontalRatio) return;
      if (dx < 0) {
        onNext();
      } else {
        onPrev();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      finish(e);
    };

    const onPointerCancel = (e: PointerEvent) => {
      activePointerId.current = null;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [horizontalRatio, onNext, onPrev, thresholdPx]);

  return ref;
}
