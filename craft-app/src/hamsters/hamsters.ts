// hamsters.ts
// The 20-hamster roster and the random "which one hatches" logic.
// Duplicates are allowed — fully random every time, per your call.

export interface Hamster {
  id: string;
  image: string; // path to /assets/hamsters/<id>.png
}

export const HAMSTERS: Hamster[] = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `hamster_${n}`, image: `/assets/hamsters/hamster_${n}.png` };
});

export function rollRandomHamster(): Hamster {
  return HAMSTERS[Math.floor(Math.random() * HAMSTERS.length)];
}

// --- Evolution forms -------------------------------------------------
// Teen and final forms are rolled independently and at random — they are
// NOT tied to which of the 20 baby hamsters started the chain. Every
// hamster in the collection keeps its baby image, personality, and traits
// forever; evolving only adds a teen/final image + new combat abilities
// on top.

export type EvolutionStage = "baby" | "teen" | "final";

export interface EvolutionForm {
  id: string;
  image: string; // path to /assets/hamsters/<teen|final>/<id>.png
}

export const TEEN_FORMS: EvolutionForm[] = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `teen_${n}`, image: `/assets/hamsters/teen/teen_${n}.png` };
});

export const FINAL_FORMS: EvolutionForm[] = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `final_${n}`, image: `/assets/hamsters/final/final_${n}.png` };
});

export function rollTeenForm(): EvolutionForm {
  return TEEN_FORMS[Math.floor(Math.random() * TEEN_FORMS.length)];
}

export function rollFinalForm(): EvolutionForm {
  return FINAL_FORMS[Math.floor(Math.random() * FINAL_FORMS.length)];
}

export function imageForForm(stage: EvolutionStage, teenFormId: string | null, finalFormId: string | null, baseImage: string) {
  if (stage === "final" && finalFormId) return FINAL_FORMS.find((f) => f.id === finalFormId)?.image || baseImage;
  if (stage === "teen" && teenFormId) return TEEN_FORMS.find((f) => f.id === teenFormId)?.image || baseImage;
  return baseImage;
}
