import type { ChannelVerification } from "../types/api";

export function bilibiliVerification(type: number | undefined): ChannelVerification | null {
  if (type === 0) return "personal";
  if (type === 1) return "organization";
  return null;
}
