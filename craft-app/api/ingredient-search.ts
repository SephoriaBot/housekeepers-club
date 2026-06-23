export interface IngredientResult {
  name: string;
  description: string;
  molecularFormula?: string;
  molecularWeight?: string;
}

export async function searchIngredient(
  ingredient: string
): Promise<IngredientResult | null> {
  const searchRes = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
      ingredient
    )}/cids/JSON`
  );

  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const cid = searchData?.IdentifierList?.CID?.[0];

  if (!cid) return null;

  const detailsRes = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight/JSON`
  );

  const detailsData = await detailsRes.json();
  const props = detailsData?.PropertyTable?.Properties?.[0];

  return {
    name: ingredient,
    description:
      "Ingredient found in PubChem. Additional cosmetic information can be generated with AI.",
    molecularFormula: props?.MolecularFormula,
    molecularWeight: props?.MolecularWeight,
  };
}