"use client";

import { useConfigStore } from "../../stores/settings";
import { useEffect, useRef } from "react";

interface StellarParticle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speed: number;
  drift: number;
  opacity: number;
  duration: number;
  delay: number;
  hue: number;
  glowColor: string;
}

export function SnowGlobal() {
  const snowParticles = useConfigStore((state) => state.snowParticles ?? true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationIdRef = useRef<number>(0);
  const particlesRef = useRef<StellarParticle[]>([]);

  function createParticle(width: number, height: number): StellarParticle {
    const size = Math.random() * 12 + 6;
    const hue = Math.random() * 60 + 200;
    return {
      x: Math.random() * width,
      y: height + Math.random() * 200,
      size,
      baseSize: size,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.4 + 0.2,
      duration: 4000 + Math.random() * 4000,
      delay: Math.random() * 1000,
      hue,
      glowColor: Math.random() < 0.3 ? "#ffffff" : `hsl(${hue}, 80%, 75%)`,
    };
  }

  function resetParticle(p: StellarParticle, width: number, height: number) {
    const newP = createParticle(width, height);
    Object.assign(p, newP);
    p.y = height + p.size;
  }

  // Main effect: runs when snowParticles is true
  useEffect(() => {
    if (!snowParticles) return;

    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    container.appendChild(canvas);

    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    let width = 0, height = 0;

    const particles: StellarParticle[] = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 30000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(width, height));
    }
    particlesRef.current = particles;

    let lastTime = performance.now();

    function animate(currentTime: number) {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.speed * dt * 0.06;
        p.x += p.drift * dt * 0.02;

        const twinklePhase = (currentTime + p.delay) / p.duration * Math.PI * 2;
        const twinkle = Math.sin(twinklePhase) * 0.5 + 0.5;
        const pulseScale = 0.85 + twinkle * 0.3;

        p.size = p.baseSize * pulseScale;
        const currentOpacity = p.opacity * (0.5 + twinkle * 0.5);

        if (p.y < -p.size - 20) {
          resetParticle(p, width, height);
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        gradient.addColorStop(0, `${p.glowColor}FF`);
        gradient.addColorStop(0.3, `${p.glowColor}80`);
        gradient.addColorStop(0.6, `${p.glowColor}30`);
        gradient.addColorStop(1, `${p.glowColor}00`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = currentOpacity * 0.6;
        ctx.fill();

        const coreGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        coreGradient.addColorStop(0, `${p.glowColor}FF`);
        coreGradient.addColorStop(0.5, `${p.glowColor}CC`);
        coreGradient.addColorStop(1, `${p.glowColor}00`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationIdRef.current = requestAnimationFrame(animate);
    }

    function resize() {
      const canvas = canvasRef.current;
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    }

    resize();
    animate(performance.now());
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", resize);
      const canvas = canvasRef.current;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [snowParticles]);

  // Cleanup effect: runs when snowParticles becomes false
  useEffect(() => {
    if (snowParticles) return;

    const canvas = canvasRef.current;
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvasRef.current = null;
    ctxRef.current = null;
    cancelAnimationFrame(animationIdRef.current);
    particlesRef.current = [];
  }, [snowParticles]);

  return <div ref={containerRef} aria-hidden="true" />;
}

export default SnowGlobal;