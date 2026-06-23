import { supabase } from '../src/lib/supabase';

export async function searchIngredient(ingredient: string) {
  const { data, error } = await supabase.functions.invoke('swift-responder', {
    body: { ingredient }
  });

  console.log("invoke response", { data, error });

  return data;
}