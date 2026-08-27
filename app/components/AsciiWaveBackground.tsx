"use client";
import { useEffect, useRef } from "react";
export function AsciiWaveBackground({ opacity = 0.58 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {alpha:true});
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio, 1.5);
    const chars = ".:-=+*#%@";
    const fontSize = 11;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      w = rect.width || 1280;
      h = rect.height || 260;
      dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / (fontSize * 0.6));
      const rows = Math.ceil(h / fontSize);
      const gust = 0.9 + Math.sin(t * 0.05) * 0.07;
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
          const rx = nx * cosA - ny * sinA * 0.18;
          const ry = nx * sinA * 0.08 + ny * cosA;
          const depth1 = Math.sin(rx * 8 - depthPhase) * 0.28 * gust;
          const depth2 = Math.sin(rx * 16 + ry * 6 - depthPhase * 1.7) * 0.14 * gust;
          const depth = depth1 + depth2;
          const perspective = 1 / (1 + depth * 0.58 + yaw * 0.28);
          const foldY = ny + depth * 0.18 + Math.sin(rx * 4 - effectiveT * 0.3) * 0.03 * gust;
          let stripeY = foldY;
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
          const shade = depth * 0.9;
          r = Math.max(0, Math.min(255, r + shade * 22));
          g = Math.max(0, Math.min(255, g + shade * 18));
          b = Math.max(0, Math.min(255, b + shade * 10));
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
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
          const py = rows > 1 ? (y / (rows - 1)) * (h - fontSize) : 0;
          ctx.fillText(ch, px, py);
        }
      }
      if (!document.hidden) raf = requestAnimationFrame(draw);
      else setTimeout(() => (raf = requestAnimationFrame(draw)), 250);
    };
    raf = requestAnimationFrame(draw);
    const onVis = () => { if (!document.hidden && !raf) raf = requestAnimationFrame(draw); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [opacity]);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" />;
}
