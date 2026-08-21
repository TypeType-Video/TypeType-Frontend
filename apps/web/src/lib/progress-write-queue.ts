type ProgressWrite = () => Promise<void>;

export class ProgressWriteQueue {
  private readonly pending = new Map<string, Promise<void>>();

  enqueue(videoUrl: string, write: ProgressWrite): Promise<void> {
    const previous = this.pending.get(videoUrl) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(write);
    this.pending.set(videoUrl, next);
    void next.then(
      () => this.removeIfCurrent(videoUrl, next),
      () => this.removeIfCurrent(videoUrl, next),
    );
    return next;
  }

  async settle(videoUrl: string): Promise<void> {
    await this.pending.get(videoUrl)?.catch(() => undefined);
  }

  private removeIfCurrent(videoUrl: string, write: Promise<void>): void {
    if (this.pending.get(videoUrl) === write) this.pending.delete(videoUrl);
  }
}

export const progressWriteQueue = new ProgressWriteQueue();
