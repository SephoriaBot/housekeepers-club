export interface Meal {
  id: string
  user_id?: string
  name: string
  time: string
  tags: string[]
  ingredients?: string[]
  created_at?: string
}


export interface Ingredient {
  name: string
  amountUS: string
  amountMetric: string
  stepRef: number[]
}

export interface RecipeStep {
  text: string
  time: string | null
  ingredientNames: string[]
}

export interface Recipe {
  title: string
  time: string
  baseServings: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
}

export interface WeekPlan {
  [day: string]: {
    breakfast: string | null
    lunch: string | null
    dinner: string | null
  }
}

export interface GroceryItem {
  id: string
  user_id?: string
  name: string
  qty: string
  checked: boolean
  created_at?: string
}

export interface PantryItem {
  id: string
  user_id?: string
  name: string
  level: 'full' | 'ok' | 'low'
  created_at?: string
}

export interface GardenPlant {
  id: string
  name: string
  scientific_name: string | null
  perenual_id: number | null
  quantity: number
  created_at: string
  medicinal_note: string | null
}