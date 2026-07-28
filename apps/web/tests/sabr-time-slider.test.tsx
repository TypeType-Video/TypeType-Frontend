import { expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

let sliderProps: Record<string, unknown> = {};
const requestSabrSeek = mock(() => true);
const remoteSeek = mock(() => undefined);

const Root = ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) => {
  sliderProps = props;
  return <>{children}</>;
};
const Slot = ({ children }: { children?: ReactNode }) => <>{children}</>;

mock.module("../src/lib/sabr-vidstack-bridge", () => ({ requestSabrSeek }));
mock.module("../src/lib/vidstack", () => ({
  TimeSlider: {
    Root,
    Preview: Slot,
    Progress: Slot,
    Thumb: Slot,
    Track: Slot,
    TrackFill: Slot,
    Value: Slot,
    Thumbnail: {
      Root: Slot,
      Img: () => null,
    },
  },
  useMediaRemote: () => ({ seek: remoteSeek }),
  useMediaState: () => 600,
}));

const { AudioTimeSlider } = await import("../src/components/audio-time-slider");
const { SabrTimeSlider } = await import("../src/components/sabr-time-slider");

const video = {
  duration: 600,
  seekable: {
    length: 0,
    start: () => 0,
    end: () => 0,
  },
} as HTMLVideoElement;

test("keeps the video SABR slider interactive while a seek is pending", () => {
  requestSabrSeek.mockClear();
  renderToStaticMarkup(<SabrTimeSlider seeking video={video} />);

  expect(sliderProps.disabled).toBeUndefined();
  expect(sliderProps["aria-busy"]).toBe(true);
  expect(sliderProps["data-seeking"]).toBe("true");

  const onDragEnd = sliderProps.onDragEnd as (percent: number) => void;
  onDragEnd(80);

  expect(requestSabrSeek).toHaveBeenCalledWith(video, 480);
});

test("keeps the audio SABR slider interactive while a seek is pending", () => {
  requestSabrSeek.mockClear();
  renderToStaticMarkup(<AudioTimeSlider seeking video={video} />);

  expect(sliderProps.disabled).toBeUndefined();
  expect(sliderProps["aria-busy"]).toBe(true);
  expect(sliderProps["data-seeking"]).toBe("true");

  const onDragEnd = sliderProps.onDragEnd as (percent: number) => void;
  onDragEnd(20);

  expect(requestSabrSeek).toHaveBeenCalledWith(video, 120);
  expect(remoteSeek).not.toHaveBeenCalled();
});
