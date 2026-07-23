import { useSyncExternalStore } from "react";
import { PRICE_REGIONS } from "./generated";

// Region options shown in the UI. "Kenya" = national median across all markets.
export const NATIONAL = "Kenya";
export const REGION_OPTIONS = [NATIONAL, ...PRICE_REGIONS] as const;
export type RegionOption = (typeof REGION_OPTIONS)[number];

const REGION_KEY = "lishe.region";
const PRICES_KEY = "lishe.prices"; // user-entered prices per food code (per portion, KES)

type State = { region: RegionOption; userPrices: Record<string, number> };

let state: State = { region: NATIONAL, userPrices: {} };
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const r = localStorage.getItem(REGION_KEY);
    if (r && (REGION_OPTIONS as readonly string[]).includes(r)) state.region = r as RegionOption;
    const p = localStorage.getItem(PRICES_KEY);
    if (p) state.userPrices = JSON.parse(p);
  } catch {
    /* ignore corrupt storage */
  }
}

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(l: () => void) {
  hydrate();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setRegion(region: RegionOption) {
  state = { ...state, region };
  if (typeof window !== "undefined") localStorage.setItem(REGION_KEY, region);
  emit();
}

export function setUserPrice(code: string, kes: number | null) {
  const next = { ...state.userPrices };
  if (kes == null || Number.isNaN(kes)) delete next[code];
  else next[code] = kes;
  state = { ...state, userPrices: next };
  if (typeof window !== "undefined") localStorage.setItem(PRICES_KEY, JSON.stringify(next));
  emit();
}

export function clearUserPrices() {
  state = { ...state, userPrices: {} };
  if (typeof window !== "undefined") localStorage.removeItem(PRICES_KEY);
  emit();
}

const serverSnap: State = { region: NATIONAL, userPrices: {} };
export function useStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return state;
    },
    () => serverSnap,
  );
}
