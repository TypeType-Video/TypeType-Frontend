import type { SabrQualityOption } from "../stores/sabr-quality-store";
import type { CodecFamily } from "./quality-utils";
import { sabrQualityTier } from "./sabr-quality-tier";

const SABR_CODEC_ORDER: CodecFamily[] = ["H.264", "VP9", "AV1"];

export function sabrResolutionOptions(
  options: SabrQualityOption[],
  selected: SabrQualityOption,
): SabrQualityOption[] {
  const byTier = new Map<number, SabrQualityOption>();
  for (const option of options) {
    const tier = sabrQualityTier(option);
    const current = byTier.get(tier);
    if (!current || option.codec === selected.codec) byTier.set(tier, option);
  }
  return [...byTier.values()].sort((left, right) => sabrQualityTier(right) - sabrQualityTier(left));
}

export function sabrCodecOptions(options: SabrQualityOption[]): CodecFamily[] {
  const available = new Set(options.map((option) => option.codec));
  return SABR_CODEC_ORDER.filter((codec) => available.has(codec));
}

export function selectSabrCodec(
  options: SabrQualityOption[],
  selected: SabrQualityOption,
  codec: CodecFamily,
): SabrQualityOption | null {
  const matching = options
    .filter((option) => option.codec === codec)
    .sort((left, right) => sabrQualityTier(right) - sabrQualityTier(left));
  const selectedTier = sabrQualityTier(selected);
  return (
    matching.find((option) => sabrQualityTier(option) === selectedTier) ??
    matching.find((option) => sabrQualityTier(option) < selectedTier) ??
    matching.at(-1) ??
    null
  );
}

export function maxSabrCodecLabel(options: SabrQualityOption[], codec: CodecFamily): string {
  const highest = options
    .filter((option) => option.codec === codec)
    .sort((left, right) => sabrQualityTier(right) - sabrQualityTier(left))[0];
  return highest?.label ?? "";
}
