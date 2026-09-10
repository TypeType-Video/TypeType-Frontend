export type DestroyableMediaProvider = {
  destroy?(): void;
};

export class MediaProviderLifecycle<T extends DestroyableMediaProvider> {
  private current: T | null = null;

  replace(next: T | null): void {
    if (this.current === next) return;
    this.current?.destroy?.();
    this.current = next;
  }

  dispose(): void {
    this.replace(null);
  }
}
