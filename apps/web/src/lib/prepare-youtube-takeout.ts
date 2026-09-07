import { BlobReader, BlobWriter, ZipReader, ZipWriter } from "@zip.js/zip.js";
import { m } from "../paraglide/messages.js";

const MAX_METADATA_BYTES = 512 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_ENTRIES = 10_000;

export async function prepareYoutubeTakeout(file: File): Promise<File> {
  const reader = new ZipReader(new BlobReader(file));
  try {
    const entries = [];
    let compressed = 0;
    let expanded = 0;
    let count = 0;
    for await (const entry of reader.getEntriesGenerator()) {
      if (++count > MAX_ENTRIES) throw new Error(m.portability_takeout_metadata_limit());
      if (entry.directory || !/youtube.*\.(csv|html|json)$/i.test(entry.filename)) continue;
      compressed += entry.compressedSize;
      expanded += entry.uncompressedSize;
      if (
        entry.encrypted ||
        entry.uncompressedSize > MAX_METADATA_BYTES ||
        compressed > MAX_METADATA_BYTES ||
        expanded > MAX_EXPANDED_BYTES
      )
        throw new Error(m.portability_takeout_metadata_limit());
      entries.push(entry);
    }
    if (!entries.length) throw new Error(m.portability_takeout_no_metadata());
    const writer = new ZipWriter(new BlobWriter("application/zip"), { passThrough: true });
    for (const entry of entries) {
      // Copy compressed metadata only; uploaded videos are never read or inflated.
      const data = await entry.getData(new BlobWriter(), { passThrough: true });
      await writer.add(entry.filename, new BlobReader(data), {
        uncompressedSize: entry.uncompressedSize,
        signature: entry.signature,
        compressionMethod: entry.compressionMethod,
      });
    }
    const result = await writer.close();
    if (result.size > MAX_METADATA_BYTES) throw new Error(m.portability_takeout_metadata_limit());
    return new File([result], "youtube-takeout.zip", { type: "application/zip" });
  } finally {
    await reader.close();
  }
}
