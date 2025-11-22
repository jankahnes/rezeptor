import type { Database } from '@/types/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type NonNullableProps<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

//Database types

export type { Database } from './supabase';

type RecipeFoodRow = Database['public']['Tables']['recipe_foods']['Row'];
export type FoodNameRow = Database['public']['Tables']['food_names']['Row'];
export type FoodRowNullable = Database['public']['Tables']['foods']['Row'];
export type FoodRow = NonNullableProps<FoodRowNullable> & {
  countable_units: Record<string, number> | null;
  satiety: number | null;
  report: any | null;
};
export type RecipeRow = Database['public']['Tables']['recipes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ActivityRow = Database['public']['Tables']['activity']['Row'];
type BrandedFoodRow = Database['public']['Tables']['branded_foods']['Row'];

export type InsertableRecipe =
  Database['public']['Tables']['recipes']['Insert'];
export type InsertableRecipeFood =
  Database['public']['Tables']['recipe_foods']['Insert'];
export type InsertableRecipeTag =
  Database['public']['Tables']['recipe_tags']['Insert'];
export type InsertableComment =
  Database['public']['Tables']['comments']['Insert'];
export type FullFoodRow = FoodRow & {
  countable_units: Record<string, number>;
  nova: 1 | 2 | 3 | 4;
  processing_level_score?: number;
};

//Main Types for the app

export type FoodRequest = Database['public']['Tables']['food_requests']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Food = Omit<FoodNameRow, 'created_at'> & {
  created_at?: string;
  food: FullFoodRow;
};

export type ShoppingListItem = {
  ingredientId: number;
  name: string;
  amount: number;
  unit: string;
  aisle: string | null;
  price: number | null;
  recipeIds: number[];
  addedAt: number;
  unit_weight: number | null;
  density: number;
};

export type Activity = ActivityRow & {
  user?: {
    username: string;
    picture: string;
    id: string;
  } | null;
  recipe?: {
    title: string;
    id: number;
    picture: string;
  } | null;
  rating?: {
    rating: number;
    recipe: {
      title: string;
      id: number;
    } | null;
  };
  food?: {
    name: string;
  } | null;
  comment?: {
    content: string;
    recipe: {
      title: string;
      id: number;
    } | null;
  };
};

export type RecipeOverview = RecipeRow & {
  tags: number[];
  user?: User | null;
  social_picture?: string | null;
};

export type Recipe = RecipeRow & {
  ingredients?: Ingredient[];
  base_ingredients?: string[];
  comments: Comment[];
  user: User | null;
  tags: number[];
  social_picture?: string | null;
};

export type Ingredient = {
  id: number;
  name: string;
  category: string | null;
  amount: number;
  unit: string;
  countable_units: Record<string, number>;
  consumption_factor: number;
  amountInfo: [number, string][];
  currentUnit: number;
  density: number;
  preparation_description: string | null;
  thermal_intensity: ThermalIntensity | null;
  heat_medium: HeatMedium | null;
  mechanical_disruption: MechanicalDisruption | null;
  thermal_description: string | null;
  mechanical_description: string | null;
  aisle: string | null;
  price: number | null;
};

export type BrandedFood = BrandedFoodRow & {
  food_name?: FoodNameRow & {
    food: FullFoodRow;
  };
};

export type User = {
  id: string;
  username: string;
  picture: string;
  created_at?: string;
};

export type FullUser = Partial<ProfileRow> &
  Partial<SupabaseUser> & {
    id: string;
    recipes?: RecipeOverview[];
    activity?: Activity[];
    likes?: RecipeOverview[];
    settings?: Record<string, any>;
    stats?: {
      recipesCount: number;
      activityCount: number;
      likesCount: number;
    };
  };

type Reply = Omit<Database['public']['Tables']['comments']['Row'], 'id'> & {
  id?: number;
  rating: number | null;
  user: User;
};

export type RecipeOverviewWithoutTags = Omit<RecipeOverview, 'tags'>;

export type Comment = Omit<
  Database['public']['Tables']['comments']['Row'],
  'id'
> & {
  id?: number;
  replies?: Reply[];
  rating: number | null;
  user: User;
};

export type Rating = Database['public']['Tables']['ratings']['Row'];

export type Tag = Database['public']['Tables']['tags']['Row'] & {
  value?: number;
};

//Types for searching and filtering

export type GetterOpts = {
  eq?: Record<string, any>;
  or?: string;
  neq?: Record<string, any>;
  in?: Record<string, any[]>;
  not?: Record<string, any>;
  limit?: number;
  range?: { from: number; to: number };
  orderBy?: { column: string; ascending?: boolean };
  filtering?: Filtering;
  search?: { column: string; query: string };
  trigram_search?: { column: string; query: string };
};

export type Filtering = {
  title?: string;
  difficulties?: string[];
  efforts?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  tags?: number[];
  hidx: [number, number] | null;
  kcal: [number, number] | null;
  price: [number, number] | null;
};

//Types related to recipe creation / computation

export type FullIngredient = FoodNameRow &
  FoodRow &
  Omit<Ingredient, 'amountInfo' | 'currentUnit'> &
  Partial<
    Pick<
      RecipeFoodRow,
      | 'heat_medium'
      | 'mechanical_disruption'
      | 'thermal_intensity'
      | 'thermal_description'
      | 'mechanical_description'
      | 'consumption_factor'
    >
  > & {
    parsed?: ParsedPart[];
    rawText?: string;
    isEditing?: boolean;
    utility?: boolean;
  };

export type EditableIngredient = {
  category: string | null;
  rawText: string;
  parsed: ParsedPart[];
  isEditing: boolean;
  // All FullIngredient properties are optional since new ingredients don't have them yet
  id?: number;
  name?: string;
  amount?: number | null;
  unit?: string | null;
  density?: number;
  preparation_description?: string | null;
  countable_units?: Record<string, number>;
  food?: FullFoodRow;
  heat_medium?: RecipeFoodRow['heat_medium'];
  mechanical_disruption?: RecipeFoodRow['mechanical_disruption'];
  thermal_intensity?: RecipeFoodRow['thermal_intensity'];
  thermal_description?: RecipeFoodRow['thermal_description'];
  mechanical_description?: RecipeFoodRow['mechanical_description'];
  consumption_factor?: RecipeFoodRow['consumption_factor'];
  utility?: boolean;
};

export type EditableTrackingItem = {
  rawText: string;
  parsed: ParsedPart[];
  amount?: number | null;
  unit?: string | null;
  food?: {
    best_similarity?: number;
    id?: number;
    food: FullFoodRow;
    food_id: number;
    is_primary: boolean;
    name: string;
  };
  brandedFoodState?:
    | 'loading'
    | 'needs_basic_info'
    | 'needs_nutrition'
    | 'matching'
    | 'complete'
    | 'error';
  brandedFood?: BrandedFood; // Store the full branded food data
};

export type BaseRecipe = {
  title: string;
  user_id: string | null;
  serves: number;
  batch_size?: number | null;
  source?: string | null;
  source_type: 'WEBSITE' | 'TITLE' | 'PICTURE' | 'MEDIA' | 'TEXT' | 'PREPARSED';
  collection?: string | null;
  description?: string | null;
  instructions?: string[] | null;
  original_image_base64?: string | null;
  based_on?: number | null;
  ingredients?: any | null;
  base_ingredients: string[];
  original_creator_channel_name?: string | null;
  original_creator_channel_id?: string | null;
};

export type UploadableRecipe = Omit<BaseRecipe, 'base_ingredients'> & {
  image_base64?: string | null;
  notes?: string[] | null;
  ingredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    category: string | null;
    preparation_description: string | null;
  }[];
};

export type ComputableRecipe = Omit<UploadableRecipe, 'ingredients'> & {
  ingredients?: UploadableRecipe['ingredients'];
  fullIngredients: FullIngredient[];
};

type CumulativeAmounts = {
  totalBeforeAlpha: number;
  total: number;
  per100: number;
  alphaFunction: alphaFunction;
  contributors: {
    name: string;
    value: number;
    totalContribution: number;
    processingLevel?: number;
  }[];
};

type RecipeCumulativeData = {
  kcal: CumulativeAmounts;
  protein: CumulativeAmounts;
  fat: CumulativeAmounts;
  saturated_fat: CumulativeAmounts;
  carbohydrates: CumulativeAmounts;
  fiber: CumulativeAmounts;
  sugar: CumulativeAmounts;
  salt: CumulativeAmounts;
  price: CumulativeAmounts;
  iron_mg: CumulativeAmounts;
  magnesium_mg: CumulativeAmounts;
  zinc_mg: CumulativeAmounts;
  calcium_mg: CumulativeAmounts;
  potassium_mg: CumulativeAmounts;
  selenium_ug: CumulativeAmounts;
  iodine_ug: CumulativeAmounts;
  copper_mg: CumulativeAmounts;
  manganese_mg: CumulativeAmounts;
  vitamin_a_ug_rae: CumulativeAmounts;
  vitamin_c_mg: CumulativeAmounts;
  vitamin_d_ug: CumulativeAmounts;
  vitamin_e_mg_alpha_te: CumulativeAmounts;
  vitamin_k_ug: CumulativeAmounts;
  thiamine_b1_mg: CumulativeAmounts;
  riboflavin_b2_mg: CumulativeAmounts;
  niacin_b3_mg: CumulativeAmounts;
  vitamin_b6_mg: CumulativeAmounts;
  folate_ug_dfe: CumulativeAmounts;
  vitamin_b12_ug: CumulativeAmounts;
  trans_fats_mg: CumulativeAmounts;
  mufas_total_mg: CumulativeAmounts;
  choline_mg: CumulativeAmounts;
  omega6_total_mg: CumulativeAmounts;
  omega3_total_mg: CumulativeAmounts;
  glucosinolates: CumulativeAmounts;
  polyphenols: CumulativeAmounts;
  carotenoids: CumulativeAmounts;
  histidine_mg: CumulativeAmounts;
  isoleucine_mg: CumulativeAmounts;
  leucine_mg: CumulativeAmounts;
  lysine_mg: CumulativeAmounts;
  methionine_mg: CumulativeAmounts;
  cysteine_mg: CumulativeAmounts;
  phenylalanine_mg: CumulativeAmounts;
  tyrosine_mg: CumulativeAmounts;
  threonine_mg: CumulativeAmounts;
  tryptophan_mg: CumulativeAmounts;
  valine_mg: CumulativeAmounts;
  nova: CumulativeAmounts;
  sidx: CumulativeAmounts;
  mnidx: CumulativeAmounts;
  fat_profile_score: CumulativeAmounts;
  protective_score: CumulativeAmounts;
};

export type ComputedRecipeInformation = RecipeCumulativeData & {
  total_weight: number;
  saltiness: number;
  added_salt: number;
  added_fat: number;
  effort: string;
  difficulty: string;
  yield_factor: number;
};

export type ComputedRecipeScores = {
  hidx: number;
  sidx: number;
  fiber_score: number;
  protein_score: number;
  salt_score: number;
  sugar_score: number;
  fat_profile_score: number;
  mnidx: number;
  satiety: number;
  processing_level_score: number;
  protective_score: number;
};

export type ComputedRecipe = ComputableRecipe &
  ComputedRecipeInformation & {
    scores: ComputedRecipeScores;
    report?: any;
    fullReport?: any;
  };

export type cumulativeKeys = Extract<
  keyof FullIngredient,
  keyof ComputedRecipe
>;

export type ProcessingRequirement = {
  has_picture?: boolean;
  has_instructions?: boolean;
  instructions_matched_to_ingredients?: boolean;
  full_nutri_processing?: boolean;
};

export type ParsedPart = {
  text: string;
  styling: string;
  type?: 'amount' | 'unit' | 'food' | 'product' | 'prep' | 'ignored' | 'request';
  barcode?: string;
  productId?: string; // barcode or product ID from DB
};

export type ThermalIntensity = Database['public']['Enums']['thermal_intensity'];
export type HeatMedium = Database['public']['Enums']['heat_medium'];
export type MechanicalDisruption =
  Database['public']['Enums']['mechanical_disruption'];

export type GptMetadataResponse = {
  general: any;
  processing: any;
  salt_and_fat: any;
  hydration: any;
};

//
