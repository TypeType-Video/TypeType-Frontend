export type BatchedWriter = {
  schedule: () => void;
  flush: () => void;
};

export function createBatchedWriter(write: () => void, delayMs: number): BatchedWriter {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    write();
  };

  return {
    schedule: () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        write();
      }, delayMs);
    },
    flush,
  };
}
