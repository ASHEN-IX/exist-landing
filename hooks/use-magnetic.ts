"use client";

import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Magnetic pull for primary CTAs.
 *
 * Pointer position is written straight to CSS custom properties on the
 * element — no React state, no re-render per pointer move. The transform is
 * applied in CSS (`translate3d(var(--mx), var(--my), 0)`), so it runs on the
 * compositor.
 *
 * Deliberately mouse-only: coarse pointers and reduced-motion users get the
 * plain button. The pull is capped at `strength` px so it never separates the
 * label from the hit area enough to feel like a miss.
 */
export default function useMagnetic<T extends HTMLElement>(
  strength = 7,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    let raf = 0;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const write = () => {
      // Ease toward the target so the pull feels weighted, not glued.
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      el.style.setProperty("--mx", `${current.x.toFixed(2)}px`);
      el.style.setProperty("--my", `${current.y.toFixed(2)}px`);

      if (
        Math.abs(target.x - current.x) > 0.05 ||
        Math.abs(target.y - current.y) > 0.05
      ) {
        raf = requestAnimationFrame(write);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      target = {
        x: Math.max(-1, Math.min(1, dx)) * strength,
        y: Math.max(-1, Math.min(1, dy)) * strength,
      };
      el.classList.add("is-magnetic");
      kick();
    };

    const onLeave = () => {
      target = { x: 0, y: 0 };
      el.classList.remove("is-magnetic");
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
  }, [strength]);

  return ref;
}
