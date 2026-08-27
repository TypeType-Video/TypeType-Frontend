export type LocaleTextAnimation = { cancel: () => void };

type AnimatedText = {
  node: Text;
  original: string;
  order: number[];
  lastRendered: string;
};

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&?+";
const ITERATIONS = 18;
const IGNORED_SELECTOR =
  "script, style, noscript, [aria-hidden='true'], [data-interface-copy-ignore]";

function isScrambleCharacter(character: string): boolean {
  return /[\p{L}\p{N}]/u.test(character);
}

export type LocaleTextSnapshot = Map<Text, string>;

export function centeredRevealOrder(text: string): number[] {
  const center = (text.length - 1) / 2;
  return [...text]
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => isScrambleCharacter(character))
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
      if (!isScrambleCharacter(character) || revealed.has(index)) return character;
      return CHARACTERS[(index * 17 + iteration * 13) % CHARACTERS.length];
    })
    .join("");
}

function isVisibleText(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent || !node.textContent?.trim() || parent.closest(IGNORED_SELECTOR)) return false;
  const style = getComputedStyle(parent);
  return (
    style.display !== "none" && style.visibility !== "hidden" && parent.getClientRects().length > 0
  );
}

export function captureLocaleText(): LocaleTextSnapshot {
  const snapshot: LocaleTextSnapshot = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (isVisibleText(text)) snapshot.set(text, text.textContent ?? "");
  }
  return snapshot;
}

function changedTextNodes(previous: LocaleTextSnapshot): AnimatedText[] {
  const animated: AnimatedText[] = [];
  for (const [node, oldText] of previous) {
    const translated = node.textContent ?? "";
    if (!node.isConnected || translated === oldText || !isVisibleText(node)) continue;
    animated.push({
      node,
      original: translated,
      order: centeredRevealOrder(translated),
      lastRendered: translated,
    });
  }
  return animated;
}

export function startLocaleDecryption(
  previous: LocaleTextSnapshot,
  durationMs: number,
): LocaleTextAnimation | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const texts = changedTextNodes(previous);
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
