export type RemotePointerSize = {
  width: number;
  height: number;
};

export type RemotePointerCoordinates = {
  x: number;
  y: number;
};

type RemotePointerSurface = RemotePointerSize & {
  left: number;
  top: number;
};

function validSize(size: RemotePointerSize | null): size is RemotePointerSize {
  return size !== null && size.width > 0 && size.height > 0;
}

export function mapYoutubeRemotePointer(
  clientX: number,
  clientY: number,
  surface: RemotePointerSurface,
  frameSize: RemotePointerSize | null,
  viewportSize: RemotePointerSize | null,
): RemotePointerCoordinates {
  const targetSize = validSize(viewportSize) ? viewportSize : frameSize;
  const displaySize = validSize(frameSize) ? frameSize : targetSize;
  const rawX = clientX - surface.left;
  const rawY = clientY - surface.top;

  if (!validSize(targetSize) || !validSize(displaySize)) {
    return { x: Math.round(rawX), y: Math.round(rawY) };
  }

  const scale = Math.min(surface.width / displaySize.width, surface.height / displaySize.height);
  if (!Number.isFinite(scale) || scale <= 0) {
    return { x: Math.round(rawX), y: Math.round(rawY) };
  }

  const offsetX = (surface.width - displaySize.width * scale) / 2;
  const offsetY = (surface.height - displaySize.height * scale) / 2;
  const displayX = (rawX - offsetX) / scale;
  const displayY = (rawY - offsetY) / scale;
  const x = Math.round((displayX / displaySize.width) * targetSize.width);
  const y = Math.round((displayY / displaySize.height) * targetSize.height);

  return {
    x: Math.max(0, Math.min(targetSize.width - 1, x)),
    y: Math.max(0, Math.min(targetSize.height - 1, y)),
  };
}
