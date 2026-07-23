import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useHamsterGrowthState } from "./useHamsterGrowth";

// This is the fix for the "two hamsters from one egg" bug: HamsterNest and
// HamsterHabitat used to each call the growth hook independently, which
// meant two separate instances both raced to check + award the same
// real-world accomplishment before either had updated hamster_last_check —
// double-counting it and sometimes double-hatching/double-evolving as a
// result.
//
// Wrap the part of the app that renders HamsterNest/HamsterHabitat in
// <HamsterGrowthProvider>, and have both of those components call
// useHamsterGrowth() from THIS file (not from useHamsterGrowth.ts
// directly). That guarantees there's only ever one growth-check running,
// with both components reading from the same shared state.

type HamsterGrowthValue = ReturnType<typeof useHamsterGrowthState>;

const HamsterGrowthContext = createContext<HamsterGrowthValue | null>(null);

export function HamsterGrowthProvider({ children }: { children: ReactNode }) {
  const value = useHamsterGrowthState();
  return <HamsterGrowthContext.Provider value={value}>{children}</HamsterGrowthContext.Provider>;
}

export function useHamsterGrowth() {
  const ctx = useContext(HamsterGrowthContext);
  if (!ctx) {
    throw new Error("useHamsterGrowth must be used within a <HamsterGrowthProvider>. Wrap the section of Dashboard.tsx that renders HamsterNest/HamsterHabitat.");
  }
  return ctx;
}
