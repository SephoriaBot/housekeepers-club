import { supabase } from "../src/lib/supabase";

export async function searchIngredient(ingredient: string) {
  const result = await supabase.functions.invoke("ingredient-search", {
    body: { ingredient }
  });

  return result;
}
