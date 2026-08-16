import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEffectiveLivePrice(avgPrice: number, livePrice: number, basePriceHint?: number): number {
  if (livePrice && livePrice > 0) return livePrice;
  if (avgPrice && avgPrice > 0) return avgPrice;
  if (basePriceHint && basePriceHint > 0) return basePriceHint;
  return 0;
}
