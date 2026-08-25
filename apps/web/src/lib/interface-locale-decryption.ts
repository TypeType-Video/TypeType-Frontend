export type LocaleTextAnimation = { cancel: () => void };

type AnimatedText = {
  node: Text;
  original: string;
  order: number[];
  lastRendered: string;
};

const COPY_SELECTOR = "[data-interface-copy]";
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&?+";
const ITERATIONS = 22;

export function centeredRevealOrder(text: string): number[] {
  const center = (text.length - 1) / 2;
  return [...text]
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => character !== " ")
    .sort((left, right) => Math.abs(left.index - center) - Math.abs(right.index - center))
    .map(({ index }) => index);
}

export function decryptedIteration(
  text: string,
  order: number[],
  iteration: number,
  maxIterations = ITERATIONS,
): string {
  const revealCount = Math.floor((iteration / maxIterations) * order.length);
  const revealed = new Set(order.slice(0, revealCount));
  return [...text]
    .map((character, index) => {
      if (character === " " || revealed.has(index)) return character;
      return CHARACTERS[(index * 17 + iteration * 13) % CHARACTERS.length];
    })
    .join("");
}

function visibleTextNodes(): AnimatedText[] {
  const seen = new Set<Node>();
  const animated: AnimatedText[] = [];
  for (const root of document.querySelectorAll<HTMLElement>(COPY_SELECTOR)) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      const original = node.textContent ?? "";
      if (seen.has(node) || !parent || !original.trim()) continue;
      seen.add(node);
      if (parent.closest("[aria-hidden='true']")) continue;
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (parent.getClientRects().length === 0) continue;
      animated.push({
        node: node as Text,
        original,
        order: centeredRevealOrder(original),
        lastRendered: original,
      });
    }
  }
  return animated;
}

export function startLocaleDecryption(durationMs: number): LocaleTextAnimation | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const texts = visibleTextNodes();
  if (texts.length === 0) return null;
  const intervalMs = durationMs / ITERATIONS;
  let iteration = 0;
  let timer: number | undefined;
  let complete = false;

  const finish = () => {
    if (complete) return;
    complete = true;
    window.clearInterval(timer);
    for (const text of texts) {
      if (text.node.textContent === text.lastRendered) text.node.textContent = text.original;
    }
  };
  const render = () => {
    iteration += 1;
    for (const text of texts) {
      text.lastRendered = decryptedIteration(text.original, text.order, iteration);
      text.node.textContent = text.lastRendered;
    }
    if (iteration >= ITERATIONS) finish();
  };

  render();
  timer = window.setInterval(render, intervalMs);
  return { cancel: finish };
}
