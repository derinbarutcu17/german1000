"use client";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
export function AsciiWaveBackground({ opacity = 0.58, bleed = 12 }: { opacity?: number; bleed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return;
    const context = ctx;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio, 1.5);
    let isInView = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = ".:-=+*#%@";
    const getFontSize = () => window.innerWidth <= 600 ? 11 : 14;
    let fontSize = getFontSize();
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      fontSize = getFontSize();
      w = rect.width || (window.innerWidth <= 600 ? 390 : 1280);
      h = (rect.height || (window.innerWidth <= 600 ? 220 : 260)) + bleed;
      dpr = 1;
      if (Math.abs(canvas.width - Math.ceil(w * dpr)) > 2 || Math.abs(canvas.height - Math.ceil(h * dpr)) > 2) {
        canvas.width = Math.ceil(w * dpr);
        canvas.height = Math.ceil(h * dpr);
        context.setTransform(dpr,0,0,dpr,0,0);
      }
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      context.textBaseline = "top";
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const schedule = () => {
      if (reducedMotion || document.hidden || !isInView || raf) return;
      raf = requestAnimationFrame(draw);
    };
    const start = performance.now();
    function draw() {
      raf = 0;
      const t = (performance.now() - start) * 0.0006;
      context.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / (fontSize * 0.6));
      const rows = Math.ceil(h / fontSize);
      const gust = 0.92;
      const effectiveT = t * 0.92;
      const yaw = 0.14;
      const waveAngle = 0.22;
      const cosA = Math.cos(waveAngle);
      const sinA = Math.sin(waveAngle);
      const depthPhase = effectiveT * 0.35;
      for (let y = 0; y < rows; y++) {
        const ny = rows > 1 ? y / (rows - 1) : 0;
        for (let x = 0; x < cols; x++) {
          const nxRaw = cols > 1 ? x / (cols - 1) : 0;
          const nx = nxRaw;
          const shearedX = nx + ny * yaw * 0.08;
          const rx = shearedX * cosA - ny * sinA * 0.18;
          const ry = nx * sinA * 0.08 + ny * cosA;
          const depth1 = Math.sin(rx * 8 - depthPhase) * 0.12 * gust;
          const depth2 = Math.sin(rx * 16 + ry * 6 - depthPhase * 1.7) * 0.06 * gust;
          const depth = depth1 + depth2;
          const perspective = 1;
          const lowerBand = Math.max(0, Math.min(1, (ny - 0.54) / 0.46));
          const broadFold =
            Math.sin(rx * 5.5 - effectiveT * 0.7 + ny * 1.8) * 0.012 +
            Math.sin(rx * 11.5 + effectiveT * 0.45 - ny * 2.4) * 0.006;
          const yellowRipple = lowerBand * lowerBand * (
            Math.sin(rx * 8.5 - effectiveT * 1.15 + ny * 2.2) * 0.045 +
            Math.sin(rx * 18 + effectiveT * 1.45 - ny * 4.4) * 0.02 +
            Math.sin(rx * 31 - effectiveT * 0.8 + ny * 7.5) * 0.011
          );
          const fabricShift = broadFold + yellowRipple;
          const stripeY = Math.max(0, Math.min(1, ny + fabricShift));
          let r = 0, g = 0, b = 0, a = opacity;
          const blend = 0.04;
          if (stripeY < 0.33 - blend) { r=0; g=0; b=0; a = opacity * 1.1 > 1 ? 1 : opacity * 1.1; }
          else if (stripeY < 0.33 + blend) {
            const t1 = (stripeY - (0.33 - blend)) / (blend*2);
            const e = t1 * t1 * (3 - 2*t1);
            r = Math.round(255 * e); g = 0; b = 0; a = opacity * (0.95 + e*0.05);
          } else if (stripeY < 0.66 - blend) { r=255; g=0; b=0; }
          else if (stripeY < 0.66 + blend) {
            const t1 = (stripeY - (0.66 - blend)) / (blend*2);
            const e = t1 * t1 * (3 - 2*t1);
            r = 255; g = Math.round(185 * e); b = 0;
          } else { r=255; g=185; b=0; }
          // Center behind headline — keep flag readable, let white halo blur it (not hide it)
          const inTitleBand = ny > 0.14 && ny < 0.56 && nx > 0.16 && nx < 0.84;
          if (inTitleBand) {
            const cx = (nx - 0.16) / 0.68;
            const cy = (ny - 0.14) / 0.42;
            const centerFade = Math.sin(cx * Math.PI) * Math.sin(cy * Math.PI);
            a *= 0.78 + 0.22 * (1 - centerFade * 0.35);
          }
          const shade = depth * 0.9;
          r = Math.max(0, Math.min(255, r + shade * 22));
          g = Math.max(0, Math.min(255, g + shade * 18));
          b = Math.max(0, Math.min(255, b + shade * 10));
          context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          const flagPhase = rx * 14 - effectiveT * 1.8 + ry * 2.5 * gust + Math.sin(ry * 2 + effectiveT * 0.2) * gust * 0.8;
          const primary = Math.sin(flagPhase + depth * 4.5) * (0.2 + nx * 0.8) * (0.5 + gust * 0.55) * perspective;
          const secondary = Math.sin(ry * 4.5 + effectiveT * 0.65 + rx * 3 * gust) * 0.18 * (0.7 + gust * 0.6) * perspective;
          const diagonal = Math.sin(rx * 9 - ry * 7 + effectiveT * 1.35) * 0.16 * gust * perspective;
          const ripple = (Math.sin(rx * 22 + effectiveT * 1.8 + gust * 2.5) * 0.11 + Math.sin(ry * 14 - effectiveT * 1.1) * 0.08 * gust) * (0.8 + gust * 0.4);
          const v = primary * 0.58 + secondary * 0.22 + diagonal * 0.12 + ripple * 0.08;
          const idx = Math.max(0, Math.min(chars.length - 1, Math.floor((v + 1) * 0.5 * chars.length)));
          let ch = chars[idx];
          if (ny < 0.08 || ny > 0.82) {
            const dense = "####%%@@@@";
            ch = dense[idx % dense.length];
          } else if ((ny > 0.78 || ny < 0.12) && (ch === "." || ch === ":")) {
            ch = "=";
          }
          if (ch === " ") continue;
          const px = cols > 1 ? (x / (cols - 1)) * (w - fontSize * 0.6) : 0;
          const basePy = rows > 1 ? (y / (rows - 1)) * (h - fontSize) : 0;
          const py = Math.max(0, Math.min(h - fontSize, basePy + fabricShift * h * 0.34));
          context.fillText(ch, px, py);
        }
      }
      schedule();
    }
    resize();
    const onResize = () => {
      resize();
      if (reducedMotion) draw();
      else schedule();
    };
    const ro = new ResizeObserver(onResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", onResize, { passive: true });
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          isInView = entry?.isIntersecting ?? true;
          if (isInView) schedule();
          else stop();
        }, { rootMargin: "160px" })
      : null;
    io?.observe(canvas);
    const onVis = () => { if (document.hidden) stop(); else schedule(); };
    document.addEventListener("visibilitychange", onVis);
    if (reducedMotion) draw();
    else schedule();
    return () => { stop(); io?.disconnect(); ro.disconnect(); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); };
  }, [bleed, opacity]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="ascii-wave-background pointer-events-none absolute inset-0"
      style={{ "--ascii-bleed": `${bleed}px`, zIndex: 0 } as CSSProperties}
    />
  );
}
