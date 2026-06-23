import { useState, useEffect, useRef, useCallback } from "react";

export const useBreakpoint = () => {
  const [bp, setBp] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    return window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const fn = () =>
      setBp(window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop");
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
};

/** Premium horizontal scroll hook — inertia + drag */
export function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const lastElement = useRef<HTMLDivElement | null>(null);
  const velocity = useRef(0);
  const raf = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const dragVelocity = useRef(0);

  const cancelMomentum = () => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  const runMomentum = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const FRICTION = 0.88;
    const step = () => {
      velocity.current *= FRICTION;
      el.scrollLeft += velocity.current;
      if (Math.abs(velocity.current) > 0.5) {
        raf.current = requestAnimationFrame(step);
      } else {
        raf.current = null;
      }
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    cancelMomentum();
    // Normalize across trackpad vs. mouse-wheel
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    velocity.current = delta * 1.8;
    runMomentum();
  }, [runMomentum]);

  useEffect(() => {
    const el = ref.current;
    if (el !== lastElement.current) {
      if (lastElement.current) {
        lastElement.current.removeEventListener("wheel", handleWheel);
      }
      lastElement.current = el;
      if (el) {
        el.addEventListener("wheel", handleWheel, { passive: false });
      }
    }
  });

  useEffect(() => {
    return () => {
      if (lastElement.current) {
        lastElement.current.removeEventListener("wheel", handleWheel);
        lastElement.current = null;
      }
    };
  }, [handleWheel]);

  // Keep a dummy onWheel callback to avoid breaking typescript compilation
  // on JSX components that pass onWheel={hScroll.onWheel}
  const onWheel = useCallback(() => {}, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button,a,input")) return;
    isDragging.current = true;
    startX.current = e.pageX;
    lastX.current = e.pageX;
    lastT.current = Date.now();
    startScroll.current = ref.current?.scrollLeft ?? 0;
    dragVelocity.current = 0;
    cancelMomentum();
    if (ref.current) ref.current.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !ref.current) return;
    const dx = e.pageX - startX.current;
    ref.current.scrollLeft = startScroll.current - dx;
    // Track instantaneous drag velocity
    const now = Date.now();
    const dt = now - lastT.current || 1;
    dragVelocity.current = ((lastX.current - e.pageX) / dt) * 12;
    lastX.current = e.pageX;
    lastT.current = now;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (ref.current) ref.current.style.cursor = "grab";
    // Carry drag velocity into momentum scroll
    velocity.current = dragVelocity.current;
    if (Math.abs(velocity.current) > 0.5) runMomentum();
  }, [runMomentum]);

  const onMouseUp = useCallback(() => endDrag(), [endDrag]);
  const onMouseLeave = useCallback(() => endDrag(), [endDrag]);

  return { ref, onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
