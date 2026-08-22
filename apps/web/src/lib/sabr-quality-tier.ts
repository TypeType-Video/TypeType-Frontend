import type { SabrQualityOption } from "../stores/sabr-quality-store";

export function sabrQualityTier(option: Pick<SabrQualityOption, "height" | "label">): number {
  const tier = Number.parseInt(option.label, 10);
  return Number.isFinite(tier) && tier > 0 ? tier : option.height;
}
