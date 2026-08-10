import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEffectiveLivePrice(avgPrice: number, livePrice: number, basePriceHint: number = 97): number {
  if (livePrice && livePrice > 0) return livePrice;
  if (avgPrice && avgPrice > 0) return avgPrice;
  return basePriceHint || 97;
}
