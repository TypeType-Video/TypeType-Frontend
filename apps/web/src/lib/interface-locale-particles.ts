type Phase = "exit" | "enter";

type Pixel = { x: number; y: number; color: string; alpha: number };
type Particle = Pixel & { dx: number; dy: number; size: number };

export type LocaleParticleAnimation = { cancel: () => void };

const COPY_SELECTOR = "[data-interface-copy]";
const MAX_PARTICLES = 1200;

function fraction(index: number, salt: number): number {
  return ((index * 9301 + salt * 49297) % 233280) / 233280;
}

export function localeParticleBudget(width: number, height: number): number {
  return Math.max(280, Math.min(MAX_PARTICLES, Math.floor((width * height) / 900)));
}

export function localeParticleOffset(index: number, distance: number): [number, number] {
  const angle = fraction(index, 3) * Math.PI * 2;
  const spread = distance * (0.35 + fraction(index, 5) * 0.65);
  return [Math.cos(angle) * spread, Math.sin(angle) * spread - distance * 0.12];
}

export function sampleOpaquePixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  step = 2,
): Pixel[] {
  const pixels: Pixel[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3];
      if (alpha < 48) continue;
      pixels.push({
        x,
        y,
        color: `rgb(${data[offset]}, ${data[offset + 1]}, ${data[offset + 2]})`,
        alpha: alpha / 255,
      });
    }
  }
  return pixels;
}

function transformedText(text: string, transform: string): string {
  if (transform === "uppercase") return text.toLocaleUpperCase();
  if (transform === "lowercase") return text.toLocaleLowerCase();
  if (transform === "capitalize") {
    return text.replace(/(^|\s)\S/gu, (match) => match.toLocaleUpperCase());
  }
  return text;
}

function textLines(text: string, widths: number[], context: CanvasRenderingContext2D): string[] {
  const words = text.trim().split(/\s+/u);
  if (widths.length <= 1 || words.length <= 1) return [text.trim()];
  const lines: string[] = [];
  let wordIndex = 0;
  for (let lineIndex = 0; lineIndex < widths.length && wordIndex < words.length; lineIndex += 1) {
    if (lineIndex === widths.length - 1) {
      lines.push(words.slice(wordIndex).join(" "));
      break;
    }
    let line = words[wordIndex++];
    while (wordIndex < words.length) {
      const candidate = `${line} ${words[wordIndex]}`;
      if (context.measureText(candidate).width > widths[lineIndex] + 1) break;
      line = candidate;
      wordIndex += 1;
    }
    lines.push(line);
  }
  return lines;
}

function rasterizeVisibleText(): Pixel[] {
  const seen = new Set<Node>();
  const pixels: Pixel[] = [];
  const mask = document.createElement("canvas");
  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) return pixels;
  for (const root of document.querySelectorAll<HTMLElement>(COPY_SELECTOR)) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (seen.has(node) || !node.textContent?.trim()) continue;
      seen.add(node);
      const parent = node.parentElement;
      if (!parent) continue;
      const style = getComputedStyle(parent);
      if (style.visibility === "hidden" || style.display === "none") continue;
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = Array.from(range.getClientRects()).filter(
        (rect) =>
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < innerHeight &&
          rect.left < innerWidth,
      );
      const lines = textLines(
        transformedText(node.textContent, style.textTransform),
        rects.map((rect) => rect.width),
        context,
      );
      for (const [index, rect] of rects.entries()) {
        const line = lines[index];
        if (!line) break;
        const padding = 4;
        mask.width = Math.ceil(rect.width) + padding * 2;
        mask.height = Math.ceil(rect.height) + padding * 2;
        context.font = style.font;
        context.fillStyle = style.color;
        context.textBaseline = "alphabetic";
        const baseline = padding + (rect.height - fontSize) / 2 + fontSize * 0.8;
        context.fillText(line, padding, baseline);
        const image = context.getImageData(0, 0, mask.width, mask.height);
        for (const pixel of sampleOpaquePixels(image.data, image.width, image.height)) {
          pixels.push({
            ...pixel,
            x: rect.left - padding + pixel.x,
            y: rect.top - padding + pixel.y,
          });
        }
      }
      range.detach();
    }
  }
  return pixels;
}

function buildParticles(distance: number): Particle[] {
  const pixels = rasterizeVisibleText();
  const budget = localeParticleBudget(innerWidth, innerHeight);
  const stride = Math.max(1, Math.ceil(pixels.length / budget));
  return pixels
    .filter((_, index) => index % stride === 0)
    .map((pixel, index) => {
      const [dx, dy] = localeParticleOffset(index, distance);
      return { ...pixel, dx, dy, size: 1.1 + pixel.alpha * 1.2 };
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
  const particles = buildParticles(Math.min(84, Math.max(52, innerWidth * 0.06)));
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
      context.globalAlpha = particle.alpha * (phase === "exit" ? 1 - linear : linear);
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
