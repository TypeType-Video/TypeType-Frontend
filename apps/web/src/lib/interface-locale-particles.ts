type Phase = "exit" | "enter";

type Particle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
};

export type LocaleParticleAnimation = {
  cancel: () => void;
};

const COPY_SELECTOR = "[data-interface-copy]";
const MAX_PARTICLES = 360;

function fraction(index: number, salt: number): number {
  return ((index * 9301 + salt * 49297) % 233280) / 233280;
}

export function localeParticleBudget(width: number, height: number): number {
  return Math.max(72, Math.min(MAX_PARTICLES, Math.floor((width * height) / 3200)));
}

export function localeParticleOffset(index: number, distance: number): [number, number] {
  const angle = fraction(index, 3) * Math.PI * 2;
  const spread = distance * (0.35 + fraction(index, 5) * 0.65);
  return [Math.cos(angle) * spread, Math.sin(angle) * spread - distance * 0.12];
}

function visibleTextRects(): Array<{ rect: DOMRect; color: string }> {
  const seen = new Set<Node>();
  const lines: Array<{ rect: DOMRect; color: string }> = [];
  for (const root of document.querySelectorAll<HTMLElement>(COPY_SELECTOR)) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (seen.has(node) || !node.textContent?.trim()) continue;
      seen.add(node);
      const parent = node.parentElement;
      if (!parent || getComputedStyle(parent).visibility === "hidden") continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const color = getComputedStyle(parent).color;
      for (const rect of range.getClientRects()) {
        if (
          rect.width > 2 &&
          rect.height > 2 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < innerHeight &&
          rect.left < innerWidth
        ) {
          lines.push({ rect, color });
        }
      }
      range.detach();
    }
  }
  return lines;
}

function buildParticles(distance: number): Particle[] {
  const lines = visibleTextRects();
  if (lines.length === 0) return [];
  const areas = lines.map(({ rect }) => Math.max(1, rect.width * rect.height));
  const totalArea = areas.reduce((sum, area) => sum + area, 0);
  const budget = localeParticleBudget(innerWidth, innerHeight);
  return Array.from({ length: budget }, (_, index) => {
    let cursor = fraction(index, 7) * totalArea;
    let lineIndex = 0;
    while (lineIndex < areas.length - 1 && cursor > areas[lineIndex]) {
      cursor -= areas[lineIndex];
      lineIndex += 1;
    }
    const { rect, color } = lines[lineIndex];
    const [dx, dy] = localeParticleOffset(index, distance);
    return {
      x: rect.left + fraction(index, 11) * rect.width,
      y: rect.top + fraction(index, 13) * rect.height,
      dx,
      dy,
      size: 1 + fraction(index, 17) * 1.4,
      color,
    };
  });
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3;
}

export function startLocaleParticleAnimation(
  phase: Phase,
  durationMs: number,
): LocaleParticleAnimation | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const particles = buildParticles(Math.min(34, Math.max(18, innerWidth * 0.025)));
  if (particles.length === 0) return null;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.className = "interface-locale-particles";
  context.scale(dpr, dpr);
  document.body.appendChild(canvas);

  let frame = 0;
  let complete = false;
  const finish = () => {
    if (complete) return;
    complete = true;
    cancelAnimationFrame(frame);
    canvas.remove();
  };
  const start = performance.now();
  const render = (now: number) => {
    const linear = Math.min(1, (now - start) / durationMs);
    const progress = easeOutCubic(linear);
    context.clearRect(0, 0, innerWidth, innerHeight);
    for (const particle of particles) {
      const travel = phase === "exit" ? progress : 1 - progress;
      context.globalAlpha = phase === "exit" ? 1 - linear : linear;
      context.fillStyle = particle.color;
      context.fillRect(
        particle.x + particle.dx * travel,
        particle.y + particle.dy * travel,
        particle.size,
        particle.size,
      );
    }
    if (linear >= 1) finish();
    else frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);
  return { cancel: finish };
}
