import { BlobReader, BlobWriter, ZipReader, ZipWriter, type FileEntry } from "@zip.js/zip.js";
import { m } from "../paraglide/messages.js";
import {
  appendTakeoutMetadata,
  isRootZipPart,
  isTakeoutMetadata,
  streamTakeoutPart,
  uniqueTakeoutEntryName,
} from "./youtube-takeout-archive";
import {
  getTakeoutDirectory,
  persistPreparedTakeout,
  type TakeoutFileHandle,
} from "./youtube-takeout-prepared-store";
import type { PortabilityPreparationProgress } from "./portability-preparation-progress";

const MAX_METADATA_BYTES = 512 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_NESTED_BYTES = 4 * 1024 * 1024 * 1024;
const MAX_NESTED_TOTAL_BYTES = 16 * 1024 * 1024 * 1024;
const MAX_NESTED_ARCHIVES = 32;
const MAX_ENTRIES = 100_000;
const MAX_IN_MEMORY_BYTES = 64 * 1024 * 1024;
const PROGRESS_INTERVAL_BYTES = 8 * 1024 * 1024;

type PrepareOptions = {
  ownerId?: string;
  onProgress?: (progress: Omit<PortabilityPreparationProgress, "ownerId">) => void;
};

function isQuotaError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    ((error as { name?: string }).name === "QuotaExceededError" ||
      (error as { name?: string }).name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export async function prepareYoutubeTakeout(file: File, options: PrepareOptions = {}): Promise<File> {
  const reader = new ZipReader(new BlobReader(file));
  const directory = options.ownerId ? await getTakeoutDirectory() : null;
  const outputName =
    directory && options.ownerId
      ? "tt-takeout-prepared-" + crypto.randomUUID() + ".zip"
      : null;
  let outputHandle: TakeoutFileHandle | null = null;
  let outputStream: WritableStream<Uint8Array> | null = null;
  let completed = false;

  try {
    const metadata: FileEntry[] = [];
    const parts: FileEntry[] = [];
    let entryCount = 0;
    let nestedBytes = 0;
    options.onProgress?.({ phase: "scanning", processed: 0, total: null });
    for await (const value of reader.getEntriesGenerator()) {
      if (++entryCount > MAX_ENTRIES) throw new Error(m.portability_takeout_metadata_limit());
      const entry = value;
      if (entryCount % 256 === 0) {
        options.onProgress?.({ phase: "scanning", processed: entryCount, total: null });
      }
      if (entry.directory) continue;
      if (isTakeoutMetadata(entry.filename)) metadata.push(entry);
      else if (isRootZipPart(entry.filename)) {
        if (entry.encrypted || entry.uncompressedSize > MAX_NESTED_BYTES) {
          throw new Error(m.portability_takeout_metadata_limit());
        }
        nestedBytes += entry.uncompressedSize;
        if (nestedBytes > MAX_NESTED_TOTAL_BYTES || parts.length >= MAX_NESTED_ARCHIVES) {
          throw new Error(m.portability_takeout_metadata_limit());
        }
        parts.push(entry);
      }
    }
    if (metadata.length === 0 && parts.length === 0) {
      throw new Error(m.portability_takeout_no_metadata());
    }
    if ((!directory || !outputName) && nestedBytes > MAX_IN_MEMORY_BYTES) {
      throw new Error(m.portability_takeout_storage_required());
    }

    if (directory && outputName) {
      outputHandle = await directory.getFileHandle(outputName, { create: true });
      outputStream = await outputHandle.createWritable();
    }
    const blobWriter = outputStream ? null : new BlobWriter("application/zip");
    const writer = new ZipWriter(outputStream ?? (blobWriter as BlobWriter), { passThrough: true });
    const usedNames = new Set<string>();
    let compressedBytes = 0;
    let expandedBytes = 0;
    let selectedCount = 0;
    let extractedBytes = 0;
    let packedBytes = 0;
    let lastExtractReport = 0;
    let lastPackReport = 0;

    const add = async (entry: FileEntry, part: number) => {
      if (entry.encrypted) throw new Error(m.portability_takeout_metadata_limit());
      compressedBytes += entry.compressedSize;
      expandedBytes += entry.uncompressedSize;
      selectedCount++;
      if (
        selectedCount > MAX_ENTRIES ||
        entry.uncompressedSize > MAX_METADATA_BYTES ||
        compressedBytes > MAX_METADATA_BYTES ||
        expandedBytes > MAX_EXPANDED_BYTES ||
        (!outputStream && compressedBytes > MAX_IN_MEMORY_BYTES)
      ) {
        throw new Error(
          !outputStream && compressedBytes > MAX_IN_MEMORY_BYTES
            ? m.portability_takeout_storage_required()
            : m.portability_takeout_metadata_limit(),
        );
      }
      options.onProgress?.({ phase: "packing", processed: packedBytes, total: null });
      await appendTakeoutMetadata(
        writer,
        entry,
        uniqueTakeoutEntryName(entry.filename, part, usedNames),
        (bytes) => {
          packedBytes += bytes;
          if (packedBytes - lastPackReport >= PROGRESS_INTERVAL_BYTES) {
            lastPackReport = packedBytes;
            options.onProgress?.({ phase: "packing", processed: packedBytes, total: null });
          }
        },
      );
    };

    try {
      for (const entry of metadata) await add(entry, 0);
      for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        if (!directory) {
          const nested = await part.getData<Blob>(new BlobWriter("application/zip"));
          const nestedReader = new ZipReader(new BlobReader(nested));
          try {
            for await (const value of nestedReader.getEntriesGenerator()) {
              if (++entryCount > MAX_ENTRIES) {
                throw new Error(m.portability_takeout_metadata_limit());
              }
              const entry = value;
              if (!entry.directory && isTakeoutMetadata(entry.filename)) {
                await add(entry, index + 1);
              }
            }
          } finally {
            await nestedReader.close();
          }
          continue;
        }

        const tempName = "tt-takeout-part-" + crypto.randomUUID() + ".zip";
        try {
          const tempHandle = await directory.getFileHandle(tempName, { create: true });
          options.onProgress?.({
            phase: "extracting",
            processed: extractedBytes,
            total: nestedBytes,
          });
          await streamTakeoutPart(part, await tempHandle.createWritable(), (bytes) => {
            extractedBytes += bytes;
            if (
              extractedBytes - lastExtractReport >= PROGRESS_INTERVAL_BYTES ||
              extractedBytes === nestedBytes
            ) {
              lastExtractReport = extractedBytes;
              options.onProgress?.({
                phase: "extracting",
                processed: extractedBytes,
                total: nestedBytes,
              });
            }
          });
          const nestedReader = new ZipReader(new BlobReader(await tempHandle.getFile()));
          try {
            for await (const value of nestedReader.getEntriesGenerator()) {
              if (++entryCount > MAX_ENTRIES) {
                throw new Error(m.portability_takeout_metadata_limit());
              }
              const entry = value;
              if (!entry.directory && isTakeoutMetadata(entry.filename)) {
                await add(entry, index + 1);
              }
            }
          } finally {
            await nestedReader.close();
          }
        } finally {
          await directory.removeEntry(tempName).catch(() => undefined);
        }
      }

      if (selectedCount === 0) throw new Error(m.portability_takeout_no_metadata());
      const result = await writer.close();
      const archive = outputHandle ? await outputHandle.getFile() : (result as Blob);
      if (archive.size > MAX_METADATA_BYTES) {
        throw new Error(m.portability_takeout_metadata_limit());
      }
      const prepared = new File([archive], "youtube-takeout.zip", { type: "application/zip" });
      if (outputName && options.ownerId) {
        await persistPreparedTakeout(options.ownerId, outputName, prepared.size);
      }
      completed = true;
      return prepared;
    } finally {
      if (!completed) await outputStream?.abort().catch(() => undefined);
    }
  } catch (error) {
    if (isQuotaError(error)) throw new Error(m.portability_takeout_storage_required());
    throw error;
  } finally {
    if (!completed && outputName) await directory?.removeEntry(outputName).catch(() => undefined);
    await reader.close();
  }
}
