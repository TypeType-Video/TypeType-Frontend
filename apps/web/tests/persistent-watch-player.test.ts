import { expect, test } from "bun:test";
import type { WatchStagePlayerProps } from "../src/components/watch-stage-player";
import { usePersistentWatchPlayerStore } from "../src/hooks/use-persistent-watch-player";

const props = {} as WatchStagePlayerProps;

test("keeps the player entry after its watch route detaches", () => {
  const owner = Symbol("test-player");
  const anchor = {} as HTMLElement;
  const store = usePersistentWatchPlayerStore.getState();

  store.register(owner, "stream-1", props, true);
  store.setAnchor(owner, anchor);
  store.setPosition({ left: 24, top: 48 });
  store.detach(owner);

  expect(usePersistentWatchPlayerStore.getState()).toMatchObject({
    position: { left: 24, top: 48 },
    entry: {
      owner,
      streamId: "stream-1",
      props,
      enabled: true,
      anchor: null,
      attached: false,
    },
  });

  store.close(owner);
  expect(usePersistentWatchPlayerStore.getState()).toMatchObject({ entry: null, position: null });
});

test("ignores lifecycle updates from an old route owner", () => {
  const firstOwner = Symbol("first-player");
  const secondOwner = Symbol("second-player");
  const firstAnchor = {} as HTMLElement;
  const secondAnchor = {} as HTMLElement;
  const store = usePersistentWatchPlayerStore.getState();

  store.register(firstOwner, "stream-1", props, true);
  store.register(secondOwner, "stream-2", props, true);
  store.setAnchor(firstOwner, firstAnchor);
  store.detach(firstOwner);
  store.setAnchor(secondOwner, secondAnchor);

  expect(usePersistentWatchPlayerStore.getState().entry).toMatchObject({
    owner: secondOwner,
    streamId: "stream-2",
    anchor: secondAnchor,
    attached: true,
  });

  store.close(secondOwner);
});
