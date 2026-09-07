import type { YoutubeRemoteInput } from "../hooks/use-youtube-remote-browser";

export const POINTER_MOVE_BATCH_MS = 16;

type PointerMove = Extract<YoutubeRemoteInput, { type: "pointer"; event: "move" }>;
type Timer = ReturnType<typeof setTimeout>;
type Schedule = (callback: () => void, delayMs: number) => Timer;
type Cancel = (timer: Timer) => void;

type Options = {
  canSend: () => boolean;
  sendImmediate: (message: YoutubeRemoteInput) => boolean;
  schedule?: Schedule;
  cancel?: Cancel;
};

export function createYoutubeRemoteInputQueue({
  canSend,
  sendImmediate,
  schedule = setTimeout,
  cancel = clearTimeout,
}: Options) {
  let pendingMove: PointerMove | null = null;
  let timer: Timer | null = null;

  function flush() {
    if (timer !== null) {
      cancel(timer);
      timer = null;
    }
    const move = pendingMove;
    pendingMove = null;
    if (move) sendImmediate(move);
  }

  function send(message: YoutubeRemoteInput) {
    if (message.type === "pointer" && message.event === "move") {
      if (!canSend()) return sendImmediate(message);
      pendingMove = message;
      if (timer === null) timer = schedule(flush, POINTER_MOVE_BATCH_MS);
      return true;
    }
    flush();
    return sendImmediate(message);
  }

  function reset() {
    if (timer !== null) cancel(timer);
    timer = null;
    pendingMove = null;
  }

  return { send, flush, reset };
}
