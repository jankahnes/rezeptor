import type { Database } from '@/types/supabase';

export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type RecipeProcessed =
  Database['public']['Tables']['recipes']['Processed'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentProcessed =
  Database['public']['Tables']['comments']['Processed'];

export type Food = Database['public']['Tables']['foods']['Row'];

export type FoodAsIngredient = Database['public']['Tables']['recipe_foods']['Processed'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type RecipeTag = Database['public']['Tables']['recipe_tags']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];

export type User = Database['public']['Tables']['profiles']['Row'];
export type UserProcessed =
  Database['public']['Tables']['profiles']['Processed'];

export type Activity = Database['public']['Tables']['activity']['Row'];
export type ActivityProcessed = Database['public']['Tables']['activity']['Processed'];
export type RecipeFood = Database['public']['Tables']['recipe_foods']['Row'];

export type GetterOpts = {
  eq?: Record<string, any>;
  in?: Record<string, any[]>;
  not?: Record<string, any>;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  filtering?: Filtering;
  search?: { column: string; query: string };
};

export type Filtering = {
  title?: string;
  difficulties?: string[];
  efforts?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  tags?: number[];
  hidx: [number, number];
  kcal: [number, number];
  price: [number, number];
};