import { expect, test } from "bun:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { resetProfileQueries } from "../src/lib/profile-query-cache";

test("refreshes mounted subscriptions without replacing their observer or media cache", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let profile = "Original";
  const observer = new QueryObserver(client, {
    queryKey: ["subscriptions"],
    queryFn: async () => [profile],
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => {});
  await observer.refetch();
  const media = { url: "playing-video" };
  client.setQueryData(["stream", "playing-video"], media);
  client.setQueryData(["history"], ["original-video"]);
  profile = "Test";

  const refresh = resetProfileQueries(client);
  expect(observer.getCurrentResult().data).toBeUndefined();
  expect(client.getQueryData(["history"])).toBeUndefined();
  expect(client.getQueryData(["stream", "playing-video"])).toBe(media);
  await refresh;
  expect(observer.getCurrentResult().data).toEqual(["Test"]);

  unsubscribe();
  client.clear();
});

test("ignores an old profile response that arrives after switching", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let finishOld: (value: string[]) => void = () => {};
  const oldResponse = new Promise<string[]>((resolve) => {
    finishOld = resolve;
  });
  let profile = "Original";
  const observer = new QueryObserver(client, {
    queryKey: ["subscriptions"],
    queryFn: () => (profile === "Original" ? oldResponse : Promise.resolve(["Test"])),
  });
  const unsubscribe = observer.subscribe(() => {});
  profile = "Test";
  await resetProfileQueries(client);
  finishOld(["Original"]);
  await oldResponse;
  expect(observer.getCurrentResult().data).toEqual(["Test"]);
  unsubscribe();
  client.clear();
});
