export type DestroyableMediaProvider = {
  readonly type?: string;
  destroy?(): void;
};

export class MediaProviderLifecycle<T extends DestroyableMediaProvider> {
  private current: T | null = null;

  replace(next: T | null): void {
    if (this.current === next) return;
    const previous = this.current;
    this.current = next;

    // Vidstack can emit more than one adapter for a provider type while a
    // source is being loaded. Destroying the first adapter here aborts the
    // HLS/DASH instance that the next adapter is still initializing.
    const sameProviderType =
      previous?.type !== undefined && next?.type !== undefined && previous.type === next.type;
    if (!sameProviderType) previous?.destroy?.();
  }

  dispose(): void {
    this.replace(null);
  }
}
