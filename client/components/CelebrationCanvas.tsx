import { useEffect, useRef } from "react";

const TIME_STEP = 1 / 60;
const HALF_PI = Math.PI * 0.5;
const PARTICLE_COUNT = 128;

interface Point {
  x: number;
  y: number;
}

interface Particle {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  x: number;
  y: number;
  r: number;
  sy: number;
  time: number;
  duration: number;
  color: string;
  complete: boolean;
}

function cubicBezier(p0: Point, c0: Point, c1: Point, p1: Point, t: number): Point {
  const nt = 1 - t;
  return {
    x: nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x,
    y: nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y,
  };
}

function outCubic(t: number, duration: number) {
  const x = t / duration - 1;
  return x * x * x + 1;
}

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

function createParticles(width: number, height: number): Particle[] {
  const center = { x: width * 0.5, y: height * 0.4 };
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    p0: { ...center },
    p1: { x: Math.random() * width, y: Math.random() * height },
    p2: { x: Math.random() * width, y: Math.random() * height },
    p3: { x: Math.random() * width, y: height + 64 },
    x: center.x,
    y: center.y,
    r: 0,
    sy: 1,
    time: 0,
    duration: 1.2 + Math.random() * 1,
    color: randomColor(),
    complete: false,
  }));
}

function updateParticle(particle: Particle) {
  particle.time = Math.min(particle.duration, particle.time + TIME_STEP);
  const f = outCubic(particle.time, particle.duration);
  const p = cubicBezier(particle.p0, particle.p1, particle.p2, particle.p3, f);
  particle.r = Math.atan2(p.y - particle.y, p.x - particle.x) + HALF_PI;
  particle.sy = Math.sin(Math.PI * f * 10);
  particle.x = p.x;
  particle.y = p.y;
  particle.complete = particle.time === particle.duration;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.r);
  ctx.scale(1, particle.sy);
  ctx.fillStyle = particle.color;
  ctx.fillRect(-4, -3, 8, 6);
  ctx.restore();
}

function startConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = createParticles(canvas.width, canvas.height);
  let frameId = 0;

  const frame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      updateParticle(particle);
      drawParticle(ctx, particle);
    });
    if (!particles.every((particle) => particle.complete)) {
      frameId = requestAnimationFrame(frame);
    }
  };

  frameId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(frameId);
}

export function CelebrationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startConfetti(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
