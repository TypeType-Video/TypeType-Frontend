import { FORMAT_NAMES } from "./portability-catalog";

export type PortabilityImportGuide = {
  description: string;
  steps: string[];
  action?: { label: string; url: string };
};

const TAKEOUT_URL =
  "https://takeout.google.com/settings/takeout/custom/youtube,my_activity?dest=mail&frequency=once";

const GUIDES: Record<string, PortabilityImportGuide> = {
  typetype: {
    description: "Move data from another TypeType instance or restore a portable backup.",
    steps: [
      "Open Settings, then Data portability on the source instance.",
      "Choose TypeType as the destination and download the export.",
      "Drop the downloaded backup below without changing it.",
    ],
  },
  "youtube-takeout": {
    description:
      "Google Takeout can provide your subscriptions, history, playlists, Watch later and liked videos.",
    steps: [
      "Open Google Takeout with YouTube and My Activity selected.",
      "Create a one-time ZIP export, then download it from Google.",
      "Drop the original ZIP below. If Google creates several ZIPs, import them one at a time.",
    ],
    action: { label: "Open Google Takeout", url: TAKEOUT_URL },
  },
  opml: {
    description: "Move subscriptions from any app or service that can export an OPML file.",
    steps: [
      "Find the subscription export or backup action in the source app.",
      "Choose OPML when the app asks for an export format.",
      "Download the OPML file, then drop it below.",
    ],
  },
};

export function portabilityImportGuide(format: string): PortabilityImportGuide {
  const guide = GUIDES[format];
  if (guide) return guide;
  const name = FORMAT_NAMES[format] ?? format;
  return {
    description: `Bring your existing ${name} data into TypeType.`,
    steps: [
      `Open ${name} and find its backup or export action.`,
      "Download the original backup file without editing or extracting it.",
      "Drop the file below. TypeType will preview the data before anything is imported.",
    ],
  };
}
