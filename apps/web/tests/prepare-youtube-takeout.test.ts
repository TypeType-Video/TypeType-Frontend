import { expect, test } from "bun:test";
import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
} from "@zip.js/zip.js";
import { prepareYoutubeTakeout } from "../src/lib/prepare-youtube-takeout";

test("preserves account metadata and excludes uploaded videos and other Google products", async () => {
  const writer = new ZipWriter(new BlobWriter());
  await writer.add(
    "Takeout/YouTube/subscriptions/subscriptions.csv",
    new TextReader("Channel Id\nUC1"),
  );
  await writer.add("Takeout/YouTube/videos/upload.mp4", new TextReader("not account data"));
  await writer.add("Takeout/Mail/mail.html", new TextReader("private unrelated data"));
  const result = await prepareYoutubeTakeout(new File([await writer.close()], "takeout.zip"));
  const reader = new ZipReader(new BlobReader(result));
  try {
    const entries = await reader.getEntries();
    expect(entries.map((entry) => entry.filename)).toEqual([
      "Takeout/YouTube/subscriptions/subscriptions.csv",
    ]);
    expect(await entries[0].getData?.(new TextWriter(), { checkSignature: true })).toBe(
      "Channel Id\nUC1",
    );
  } finally {
    await reader.close();
  }
});

test("rejects a video-only part instead of starting an empty import", async () => {
  const writer = new ZipWriter(new BlobWriter());
  await writer.add("Takeout/YouTube/videos/upload.mp4", new TextReader("video"));
  await expect(
    prepareYoutubeTakeout(new File([await writer.close()], "takeout.zip")),
  ).rejects.toThrow();
});
