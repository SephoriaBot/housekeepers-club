import { useState } from 'react'
import styles from './BreadRecipes.module.css'

interface Tweak {
  label: string
  description: string
}

interface BreadRecipe {
  id: string
  category: string
  name: string
  setting: string
  loafSize: string
  ingredients: string[]
  tweaks: Tweak[]
}

const RECIPES: BreadRecipe[] = [
  // Basic White & Wheat
  {
    id: 'classic-white',
    category: 'Basic White & Wheat',
    name: 'Classic White Bread',
    setting: 'Basic / White — Medium Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 1/8 cups warm water (80°F)',
      '2 tbsp butter, softened',
      '1 1/2 tsp salt',
      '3 tbsp sugar',
      '3 1/4 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Softer crust', description: 'Switch to Light Crust setting and brush top with melted butter right after baking.' },
      { label: 'Crispier crust', description: 'Use Dark Crust setting and swap butter for olive oil.' },
      { label: 'Richer flavor', description: 'Replace water with whole milk and add an extra tablespoon of butter.' },
      { label: 'Slightly sweet', description: 'Increase sugar to 4 tbsp and add 1 tsp vanilla extract.' },
    ],
  },
  {
    id: 'whole-wheat',
    category: 'Basic White & Wheat',
    name: 'Whole Wheat Bread',
    setting: 'Whole Wheat — Medium Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 1/4 cups warm water (80°F)',
      '2 tbsp olive oil',
      '1 1/2 tsp salt',
      '2 tbsp honey',
      '2 cups whole wheat flour',
      '1 cup bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Lighter texture', description: 'Increase bread flour to 1 1/2 cups and reduce whole wheat to 1 1/2 cups.' },
      { label: 'Nuttier flavor', description: 'Add 2 tbsp flaxseed or sunflower seeds to the dough.' },
      { label: 'Softer loaf', description: 'Add 2 tbsp powdered milk and increase oil to 3 tbsp.' },
      { label: 'Heartier', description: 'Use all whole wheat flour (3 cups total) and add 1 tbsp molasses.' },
    ],
  },
  {
    id: 'white-wheat-blend',
    category: 'Basic White & Wheat',
    name: 'White Wheat Blend',
    setting: 'Basic / White — Light Crust',
    loafSize: '1.5 lb',
    ingredients: [
      '1 cup warm water (80°F)',
      '1 1/2 tbsp butter',
      '1 1/4 tsp salt',
      '2 tbsp sugar',
      '1 1/2 cups bread flour',
      '1 cup white whole wheat flour',
      '1 3/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'More wheat flavor', description: 'Flip the flour ratio: 1 1/2 cups whole wheat, 1 cup bread flour.' },
      { label: 'Fluffier loaf', description: 'Add 1 tbsp vital wheat gluten to boost rise.' },
      { label: 'Sweeter', description: 'Increase sugar to 3 tbsp and add 1 tbsp honey.' },
    ],
  },

  // Sweet Breads
  {
    id: 'banana-bread',
    category: 'Sweet Breads',
    name: 'Banana Bread',
    setting: 'Sweet — Light Crust',
    loafSize: '1.5 lb',
    ingredients: [
      '1/2 cup mashed ripe banana (about 1 large)',
      '1/2 cup warm water (80°F)',
      '2 tbsp butter, softened',
      '1 egg, beaten',
      '1 tsp salt',
      '1/4 cup sugar',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'More banana flavor', description: 'Use 3/4 cup mashed banana and reduce water to 1/4 cup.' },
      { label: 'Add chocolate', description: 'Toss in 1/2 cup mini chocolate chips at the add-in beep.' },
      { label: 'Spiced version', description: 'Add 1 tsp cinnamon and 1/4 tsp nutmeg with the flour.' },
      { label: 'Extra moist', description: 'Add 2 tbsp sour cream and increase butter to 3 tbsp.' },
    ],
  },
  {
    id: 'cinnamon-raisin',
    category: 'Sweet Breads',
    name: 'Cinnamon Raisin Bread',
    setting: 'Sweet — Medium Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 cup warm water (80°F)',
      '2 tbsp butter, softened',
      '1 tsp salt',
      '3 tbsp sugar',
      '1 1/2 tsp cinnamon',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
      '3/4 cup raisins (add at beep)',
    ],
    tweaks: [
      { label: 'More cinnamon', description: 'Increase cinnamon to 2 tsp and add 1/4 tsp cardamom.' },
      { label: 'Swap raisins', description: 'Use dried cranberries or chopped dates instead of raisins.' },
      { label: 'Sweeter loaf', description: 'Increase sugar to 1/4 cup and add 1 tbsp brown sugar.' },
      { label: 'Add nuts', description: 'Add 1/3 cup chopped walnuts or pecans at the add-in beep.' },
    ],
  },

  // Savory
  {
    id: 'herb-bread',
    category: 'Savory',
    name: 'Herb & Olive Oil Bread',
    setting: 'Basic / White — Dark Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 1/8 cups warm water (80°F)',
      '3 tbsp olive oil',
      '1 1/2 tsp salt',
      '1 tbsp sugar',
      '1 tsp dried rosemary',
      '1 tsp dried thyme',
      '1/2 tsp garlic powder',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Milder herb flavor', description: 'Reduce herbs to 1/2 tsp each and omit garlic powder.' },
      { label: 'Stronger herb flavor', description: 'Double all herbs and add 1 tsp dried basil.' },
      { label: 'Sun-dried tomato', description: 'Add 1/4 cup chopped sun-dried tomatoes at the add-in beep.' },
      { label: 'Italian style', description: 'Add 1 tsp Italian seasoning and 2 tbsp grated Parmesan.' },
    ],
  },
  {
    id: 'garlic-bread',
    category: 'Savory',
    name: 'Roasted Garlic Bread',
    setting: 'Basic / White — Medium Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 cup warm water (80°F)',
      '2 tbsp olive oil',
      '1 1/2 tsp salt',
      '1 tbsp sugar',
      '3 cloves roasted garlic, mashed',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'More garlic', description: 'Add a 4th clove and 1/4 tsp garlic powder for extra punch.' },
      { label: 'Milder garlic', description: 'Use 2 cloves and replace olive oil with butter for a softer flavor.' },
      { label: 'Add cheese', description: 'Mix in 1/3 cup shredded Parmesan with the flour.' },
      { label: 'Spicy version', description: 'Add 1/2 tsp red pepper flakes and 1/4 tsp black pepper.' },
    ],
  },
  {
    id: 'cheese-bread',
    category: 'Savory',
    name: 'Cheddar Cheese Bread',
    setting: 'Basic / White — Light Crust',
    loafSize: '2 lb',
    ingredients: [
      '1 cup warm water (80°F)',
      '1 tbsp butter',
      '1 1/2 tsp salt',
      '1 tbsp sugar',
      '3 cups bread flour',
      '3/4 cup shredded sharp cheddar',
      '2 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Extra cheesy', description: 'Increase cheddar to 1 cup and add 2 tbsp Parmesan.' },
      { label: 'Spicy cheddar', description: 'Use pepper jack instead of cheddar and add 1/4 tsp cayenne.' },
      { label: 'Herb & cheese', description: 'Add 1 tsp dried chives and 1/2 tsp garlic powder.' },
      { label: 'Lighter cheese flavor', description: 'Reduce cheddar to 1/2 cup and use mild instead of sharp.' },
    ],
  },

  // Gluten Free
  {
    id: 'gf-white',
    category: 'Gluten Free',
    name: 'Gluten Free White Bread',
    setting: 'Gluten Free — Medium Crust',
    loafSize: '1.5 lb',
    ingredients: [
      '1 1/4 cups warm water (80°F)',
      '2 tbsp olive oil',
      '3 eggs, beaten',
      '1 tsp apple cider vinegar',
      '1 1/2 tsp salt',
      '3 tbsp sugar',
      '3 cups gluten free bread flour blend',
      '2 1/4 tsp active dry yeast',
      '1 tsp xanthan gum (if not in flour blend)',
    ],
    tweaks: [
      { label: 'Better rise', description: 'Add an extra 1/2 tsp xanthan gum and make sure water is exactly 80°F.' },
      { label: 'Softer texture', description: 'Replace one egg with 1/4 cup plain yogurt.' },
      { label: 'Richer flavor', description: 'Replace water with warm whole milk.' },
      { label: 'Less eggy', description: 'Use 2 eggs plus 2 tbsp aquafaba (chickpea liquid) instead of 3 eggs.' },
    ],
  },
  {
    id: 'gf-herb',
    category: 'Gluten Free',
    name: 'Gluten Free Herb Bread',
    setting: 'Gluten Free — Medium Crust',
    loafSize: '1.5 lb',
    ingredients: [
      '1 1/4 cups warm water (80°F)',
      '3 tbsp olive oil',
      '3 eggs, beaten',
      '1 tsp apple cider vinegar',
      '1 1/2 tsp salt',
      '2 tbsp sugar',
      '1 tsp rosemary',
      '1 tsp thyme',
      '3 cups gluten free bread flour blend',
      '2 1/4 tsp active dry yeast',
      '1 tsp xanthan gum (if not in blend)',
    ],
    tweaks: [
      { label: 'Milder herbs', description: 'Reduce to 1/2 tsp each herb and add 1/4 tsp onion powder instead.' },
      { label: 'Add garlic', description: 'Mix in 1 tsp garlic powder and 2 tbsp Parmesan.' },
    ],
  },

  // Dough Only
  {
    id: 'pizza-dough',
    category: 'Dough Only',
    name: 'Pizza Dough',
    setting: 'Dough — no bake',
    loafSize: 'Makes 2 medium pizzas',
    ingredients: [
      '1 cup warm water (80°F)',
      '2 tbsp olive oil',
      '1 tsp salt',
      '1 tsp sugar',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Crispier crust', description: 'Replace 1/2 cup bread flour with semolina flour.' },
      { label: 'Chewier crust', description: 'Let dough cold-ferment in the fridge overnight before shaping.' },
      { label: 'Herb crust', description: 'Add 1 tsp Italian seasoning and 1/2 tsp garlic powder to the flour.' },
      { label: 'Thicker crust', description: 'Use dough for 1 large pizza instead of 2, and let it proof 20 min before topping.' },
    ],
  },
  {
    id: 'dinner-rolls',
    category: 'Dough Only',
    name: 'Dinner Rolls Dough',
    setting: 'Dough — no bake',
    loafSize: 'Makes 12 rolls',
    ingredients: [
      '1 cup warm milk (80°F)',
      '3 tbsp butter, softened',
      '1 egg, beaten',
      '1 tsp salt',
      '3 tbsp sugar',
      '3 cups bread flour',
      '2 1/4 tsp active dry yeast',
    ],
    tweaks: [
      { label: 'Fluffier rolls', description: 'Add 1 tbsp extra butter and let shaped rolls proof 30–40 min before baking at 375°F.' },
      { label: 'Buttery top', description: 'Brush rolls with melted butter right out of the oven.' },
      { label: 'Sweet rolls base', description: 'Increase sugar to 1/4 cup and add 1 tsp vanilla — use as a base for cinnamon rolls.' },
      { label: 'Savory rolls', description: 'Reduce sugar to 1 tsp, add 1 tsp garlic powder and 1 tbsp fresh chives.' },
    ],
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(RECIPES.map(r => r.category)))]

export default function BreadRecipes() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<BreadRecipe | null>(null)

  const filtered = RECIPES.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Kitchen · Breadman TR2200C</p>
          <h1 className={styles.title}>Bread Machine Recipes</h1>
        </div>
      </div>

      {!selected && (
        <>
          <input
            className={styles.searchInput}
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.chips}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            {filtered.map(recipe => (
              <div key={recipe.id} className={`card ${styles.recipeCard}`} onClick={() => setSelected(recipe)}>
                <div className={styles.cardTop}>
                  <span className={styles.categoryBadge}>{recipe.category}</span>
                </div>
                <h3 className={styles.recipeName}>{recipe.name}</h3>
                <p className={styles.recipeMeta}>{recipe.setting}</p>
                <p className={styles.recipeMeta}>{recipe.loafSize}</p>
                <p className={styles.tweakCount}>✦ {recipe.tweaks.length} tweaks</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className={styles.detail}>
          <button className="btn-ghost" style={{ marginBottom: '1.25rem' }} onClick={() => setSelected(null)}>
            ← back to recipes
          </button>

          <div className={styles.detailHeader}>
            <span className={styles.categoryBadge}>{selected.category}</span>
            <h2 className={styles.detailTitle}>{selected.name}</h2>
            <div className={styles.detailMeta}>
              <span className={styles.metaPill}>⚙️ {selected.setting}</span>
              <span className={styles.metaPill}>🍞 {selected.loafSize}</span>
            </div>
          </div>

          <div className={styles.detailGrid}>
            {/* Ingredients */}
            <div className={`card ${styles.detailCard}`}>
              <h3 className={styles.cardTitle}>Ingredients</h3>
              <ul className={styles.ingredientList}>
                {selected.ingredients.map((ing, i) => (
                  <li key={i} className={styles.ingredientItem}>
                    <span className={styles.bullet}>✦</span> {ing}
                  </li>
                ))}
              </ul>
              <div className={styles.tip}>
                <strong>Tip:</strong> Always add ingredients in order listed — liquids first, yeast last and never touching salt.
              </div>
            </div>

            {/* Tweaks */}
            <div className={`card ${styles.detailCard}`}>
              <h3 className={styles.cardTitle}>Tweaks & Variations</h3>
              <div className={styles.tweakList}>
                {selected.tweaks.map((tweak, i) => (
                  <div key={i} className={styles.tweakItem}>
                    <div className={styles.tweakLabel}>{tweak.label}</div>
                    <div className={styles.tweakDesc}>{tweak.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
