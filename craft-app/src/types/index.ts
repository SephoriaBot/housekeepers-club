// ===== GLOBAL SAFE BASE =====
export type BaseEntity = {
  id: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

// ===== RECIPES =====
export type Recipe = BaseEntity & {
  name?: string
  title?: string
  description?: string
  category?: string
  difficulty?: string
  prep_time_min?: number
  cook_time_min?: number
  tags?: string[]
}

export type RecipeIngredient = {
  name?: string
  qty?: string
  unit?: string
}

export type RecipeCategory = string

export type RecipeStep = BaseEntity & {
  step_number?: number
  instruction?: string
}

// ===== PLANTS =====
export type Plant = BaseEntity & {
  name?: string
  species?: string
}

export type PlantType = string

export type PlantLog = BaseEntity & {
  note?: string
  action?: LogAction
  date?: string
}

export type LogAction = string

// ===== PETS =====
export type Pet = BaseEntity & {
  name?: string
  type?: string
  breed?: string
  age?: number
}

// ===== GROCERY =====
export type GroceryItem = BaseEntity & {
  name: string
  qty?: string
  checked?: boolean
}

// ===== PRICES =====
export type PriceEntry = BaseEntity & {
  item_name: string
  store: string
  price: number
  updated_at?: string
}

// ===== SAVED LISTS =====
export type SavedList = BaseEntity & {
  name: string
  items: string[]
}