import { FORMAT_NAMES } from "./portability-catalog";
import { m } from "../paraglide/messages.js";

export type PortabilityImportGuide = {
  description: string;
  steps: string[];
  action?: { label: string; url: string };
};

const TAKEOUT_URL =
  "https://takeout.google.com/settings/takeout/custom/youtube,my_activity?dest=mail&frequency=once";

export function portabilityImportGuide(format: string): PortabilityImportGuide {
  if (format === "typetype") {
    return {
      description: m.portability_guide_typetype_description(),
      steps: [
        m.portability_guide_typetype_step_one(),
        m.portability_guide_typetype_step_two(),
        m.portability_guide_typetype_step_three(),
      ],
    };
  }
  if (format === "youtube-takeout") {
    return {
      description: m.portability_guide_takeout_description(),
      steps: [
        m.portability_guide_takeout_step_one(),
        m.portability_guide_takeout_step_two(),
        m.portability_guide_takeout_step_three(),
      ],
      action: { label: m.portability_guide_takeout_action(), url: TAKEOUT_URL },
    };
  }
  if (format === "opml") {
    return {
      description: m.portability_guide_opml_description(),
      steps: [
        m.portability_guide_opml_step_one(),
        m.portability_guide_opml_step_two(),
        m.portability_guide_opml_step_three(),
      ],
    };
  }
  const name = FORMAT_NAMES[format] ?? format;
  return {
    description: `${m.portability_guide_generic_prefix()} ${name} ${m.portability_guide_generic_suffix()}`,
    steps: [
      `${m.portability_guide_generic_open_prefix()} ${name} ${m.portability_guide_generic_open_suffix()}`,
      m.portability_guide_generic_download(),
      m.portability_guide_generic_drop(),
    ],
  };
}
