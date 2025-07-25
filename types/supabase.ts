export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity: {
        Processed: {
          id: number;
          created_at: string;
          type: Database['public']['Enums']['activity_type'];
          user_id: string | null;
          rating_id: number | null;
          recipe_id: number | null;
          food_id: number | null;
          comment_id: number | null;
          user: { username: string };
          comment: {
            content: string;
            recipe: { title: string; id: number };
          };
          recipe: { title: string; id: number };
          rating: {
            rating: number;
            recipe: { title: string; id: number };
          };
          food: { name: string };
        };
        Row: {
          comment_id: number | null;
          created_at: string;
          food_id: number | null;
          id: number;
          rating_id: number | null;
          recipe_id: number | null;
          type: Database['public']['Enums']['activity_type'];
          user_id: string | null;
        };
        Insert: {
          comment_id?: number | null;
          created_at?: string;
          food_id?: number | null;
          id?: number;
          rating_id?: number | null;
          recipe_id?: number | null;
          type: Database['public']['Enums']['activity_type'];
          user_id?: string | null;
        };
        Update: {
          comment_id?: number | null;
          created_at?: string;
          food_id?: number | null;
          id?: number;
          rating_id?: number | null;
          recipe_id?: number | null;
          type?: Database['public']['Enums']['activity_type'];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_food_id_fkey';
            columns: ['food_id'];
            isOneToOne: false;
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_rating_id_fkey';
            columns: ['rating_id'];
            isOneToOne: false;
            referencedRelation: 'ratings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      comments: {
        Processed: {
          content: string;
          created_at: string;
          id: number;
          recipe_id: number;
          replying_to: number | null;
          user_id: string;
          rating: number | null;
          replies: CommentProcessed[];
          user: {
            username: string;
            id: string; 
            picture: string;
          };
        };
        Row: {
          content: string;
          created_at: string;
          id: number;
          recipe_id: number;
          replying_to: number | null;
          user_id: string;
        };
        Insert: {
          content?: string;
          created_at?: string;
          id?: number;
          recipe_id: number;
          replying_to?: number | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: number;
          recipe_id?: number;
          replying_to?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_replying_to_fkey';
            columns: ['replying_to'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      foods: {
        Row: {
          calcium_mg: number | null;
          carbohydrates: number | null;
          choline_mg: number | null;
          copper_mg: number | null;
          created_at: string;
          density: number | null;
          ed: number | null;
          fat: number | null;
          fat_profile_score: number | null;
          fiber: number | null;
          fiber_score: number | null;
          folate_ug_dfe: number | null;
          gluten_free: boolean | null;
          hidx: number | null;
          id: number;
          iodine_ug: number | null;
          iron_mg: number | null;
          kcal: number | null;
          magnesium_mg: number | null;
          manganese_mg: number | null;
          measurements: string[];
          mnidx: number | null;
          mufas_total_mg: number | null;
          name: string;
          niacin_b3_mg: number | null;
          omega3_total_mg: number | null;
          omega6_total_mg: number | null;
          polyphenols_total_mg: number | null;
          potassium_mg: number | null;
          price: number | null;
          processing_level: number | null;
          protein: number | null;
          protein_score: number | null;
          riboflavin_b2_mg: number | null;
          salt: number | null;
          salt_score: number | null;
          saturated_fat: number | null;
          selenium_ug: number | null;
          sidx: number | null;
          sugar: number | null;
          sugar_score: number | null;
          thiamine_b1_mg: number | null;
          trans_fats_mg: number | null;
          unit_name: string | null;
          unit_weight: number | null;
          vegan: boolean | null;
          vegetarian: boolean | null;
          vitamin_a_ug_rae: number | null;
          vitamin_b12_ug: number | null;
          vitamin_b6_mg: number | null;
          vitamin_c_mg: number | null;
          vitamin_d_ug: number | null;
          vitamin_e_mg_alpha_te: number | null;
          vitamin_k_ug: number | null;
          zinc_mg: number | null;
        };
        Insert: {
          calcium_mg?: number | null;
          carbohydrates?: number | null;
          choline_mg?: number | null;
          copper_mg?: number | null;
          created_at?: string;
          density?: number | null;
          ed?: number | null;
          fat?: number | null;
          fat_profile_score?: number | null;
          fiber?: number | null;
          fiber_score?: number | null;
          folate_ug_dfe?: number | null;
          gluten_free?: boolean | null;
          hidx?: number | null;
          id?: number;
          iodine_ug?: number | null;
          iron_mg?: number | null;
          kcal?: number | null;
          magnesium_mg?: number | null;
          manganese_mg?: number | null;
          measurements?: string[];
          mnidx?: number | null;
          mufas_total_mg?: number | null;
          name?: string;
          niacin_b3_mg?: number | null;
          omega3_total_mg?: number | null;
          omega6_total_mg?: number | null;
          polyphenols_total_mg?: number | null;
          potassium_mg?: number | null;
          price?: number | null;
          processing_level?: number | null;
          protein?: number | null;
          protein_score?: number | null;
          riboflavin_b2_mg?: number | null;
          salt?: number | null;
          salt_score?: number | null;
          saturated_fat?: number | null;
          selenium_ug?: number | null;
          sidx?: number | null;
          sugar?: number | null;
          sugar_score?: number | null;
          thiamine_b1_mg?: number | null;
          trans_fats_mg?: number | null;
          unit_name?: string | null;
          unit_weight?: number | null;
          vegan?: boolean | null;
          vegetarian?: boolean | null;
          vitamin_a_ug_rae?: number | null;
          vitamin_b12_ug?: number | null;
          vitamin_b6_mg?: number | null;
          vitamin_c_mg?: number | null;
          vitamin_d_ug?: number | null;
          vitamin_e_mg_alpha_te?: number | null;
          vitamin_k_ug?: number | null;
          zinc_mg?: number | null;
        };
        Update: {
          calcium_mg?: number | null;
          carbohydrates?: number | null;
          choline_mg?: number | null;
          copper_mg?: number | null;
          created_at?: string;
          density?: number | null;
          ed?: number | null;
          fat?: number | null;
          fat_profile_score?: number | null;
          fiber?: number | null;
          fiber_score?: number | null;
          folate_ug_dfe?: number | null;
          gluten_free?: boolean | null;
          hidx?: number | null;
          id?: number;
          iodine_ug?: number | null;
          iron_mg?: number | null;
          kcal?: number | null;
          magnesium_mg?: number | null;
          manganese_mg?: number | null;
          measurements?: string[];
          mnidx?: number | null;
          mufas_total_mg?: number | null;
          name?: string;
          niacin_b3_mg?: number | null;
          omega3_total_mg?: number | null;
          omega6_total_mg?: number | null;
          polyphenols_total_mg?: number | null;
          potassium_mg?: number | null;
          price?: number | null;
          processing_level?: number | null;
          protein?: number | null;
          protein_score?: number | null;
          riboflavin_b2_mg?: number | null;
          salt?: number | null;
          salt_score?: number | null;
          saturated_fat?: number | null;
          selenium_ug?: number | null;
          sidx?: number | null;
          sugar?: number | null;
          sugar_score?: number | null;
          thiamine_b1_mg?: number | null;
          trans_fats_mg?: number | null;
          unit_name?: string | null;
          unit_weight?: number | null;
          vegan?: boolean | null;
          vegetarian?: boolean | null;
          vitamin_a_ug_rae?: number | null;
          vitamin_b12_ug?: number | null;
          vitamin_b6_mg?: number | null;
          vitamin_c_mg?: number | null;
          vitamin_d_ug?: number | null;
          vitamin_e_mg_alpha_te?: number | null;
          vitamin_k_ug?: number | null;
          zinc_mg?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Processed: {
          created_at: string;
          id: string;
          picture: string;
          username: string;
          recipes: RecipeProcessed[];
          activity: Activity[];
          likes: RecipeProcessed[];
          stats: Object;
          settings: Object;
        };
        Row: {
          created_at: string;
          id: string;
          picture: string;
          username: string;
          settings: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          picture?: string;
          username: string;
          settings: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          picture?: string;
          username?: string;
          settings: Json;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          created_at: string;
          id: number;
          rating: number | null;
          recipe_id: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          rating?: number | null;
          recipe_id?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          rating?: number | null;
          recipe_id?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      recipe_foods: {
        Processed: {
            amount: number;
            unit: string;
            density: number | null;
            id: number;
            measurements: string[];
            name: string;
            unit_name: string | null;
            unit_weight: number | null;
            category: string;
            price: number | null;
            amountInfo: [number, string][];
            possibleUnits: string[];
            currentUnit: number;
        }
        Row: {
          amount: number | null;
          category: string | null;
          food_id: number;
          recipe_id: number;
          unit: Database['public']['Enums']['unit'] | null;
        };
        Insert: {
          amount?: number | null;
          category?: string | null;
          food_id: number;
          recipe_id: number;
          unit?: Database['public']['Enums']['unit'] | null;
        };
        Update: {
          amount?: number | null;
          category?: string | null;
          food_id?: number;
          recipe_id?: number;
          unit?: Database['public']['Enums']['unit'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_foods_food_id_fkey';
            columns: ['food_id'];
            isOneToOne: false;
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_foods_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          }
        ];
      };
      recipe_tags: {
        Row: {
          recipe_id: number;
          tag_id: number;
        };
        Insert: {
          recipe_id: number;
          tag_id: number;
        };
        Update: {
          recipe_id?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_tags_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          }
        ];
      };
      recipes: {
        Processed: {
          carbohydrates: number | null;
          created_at: string;
          comments: CommentProcessed[];
          description: string;
          difficulty: Database['public']['Enums']['difficulty'] | null;
          ed: number | null;
          effort: Database['public']['Enums']['effort'] | null;
          fat: number | null;
          fat_profile_score: number | null;
          fiber: number | null;
          fiber_score: number | null;
          forked_from: number | null;
          hidx: number | null;
          id: number;
          instructions: string[] | null;
          kcal: number | null;
          mnidx: number | null;
          picture: string | null;
          price: number | null;
          processing_level_score: number | null;
          protein: number | null;
          protein_score: number | null;
          rating: number | null;
          salt: number | null;
          salt_score: number | null;
          saturated_fat: number | null;
          sidx: number | null;
          tags: number[];
          ingredients: Food[];
          sugar: number | null;
          sugar_score: number | null;
          title: string;
          user_id: string | null;
          visibility: Database['public']['Enums']['visibility'] | null;
        };
        Row: {
          carbohydrates: number | null;
          created_at: string;
          difficulty: Database['public']['Enums']['difficulty'] | null;
          description: string;
          ed: number | null;
          effort: Database['public']['Enums']['effort'] | null;
          fat: number | null;
          fat_profile_score: number | null;
          fiber: number | null;
          fiber_score: number | null;
          forked_from: number | null;
          hidx: number | null;
          id: number;
          instructions: string[] | null;
          kcal: number | null;
          mnidx: number | null;
          picture: string | null;
          price: number | null;
          processing_level_score: number | null;
          protein: number | null;
          protein_score: number | null;
          rating: number | null;
          salt: number | null;
          salt_score: number | null;
          saturated_fat: number | null;
          sidx: number | null;
          sugar: number | null;
          sugar_score: number | null;
          title: string;
          user_id: string | null;
          visibility: Database['public']['Enums']['visibility'] | null;
        };
        Insert: {
          carbohydrates?: number | null;
          created_at?: string;
          difficulty?: Database['public']['Enums']['difficulty'] | null;
          ed?: number | null;
          effort?: Database['public']['Enums']['effort'] | null;
          fat?: number | null;
          fat_profile_score?: number | null;
          fiber?: number | null;
          fiber_score?: number | null;
          forked_from?: number | null;
          hidx?: number | null;
          id?: number;
          instructions?: string[] | null;
          kcal?: number | null;
          mnidx?: number | null;
          picture?: string | null;
          price?: number | null;
          processing_level_score?: number | null;
          protein?: number | null;
          rating?: number | null;
          salt?: number | null;
          salt_score?: number | null;
          saturated_fat?: number | null;
          sidx?: number | null;
          sugar?: number | null;
          sugar_score?: number | null;
          title: string;
          user_id?: string | null;
          visibility?: Database['public']['Enums']['visibility'] | null;
        };
        Update: {
          carbohydrates?: number | null;
          created_at?: string;
          difficulty?: Database['public']['Enums']['difficulty'] | null;
          ed?: number | null;
          effort?: Database['public']['Enums']['effort'] | null;
          fat?: number | null;
          fat_profile_score?: number | null;
          fiber?: number | null;
          fiber_score?: number | null;
          forked_from?: number | null;
          hidx?: number | null;
          id?: number;
          instructions?: string[] | null;
          kcal?: number | null;
          mnidx?: number | null;
          picture?: string | null;
          price?: number | null;
          processing_level_score?: number | null;
          protein?: number | null;
          rating?: number | null;
          salt?: number | null;
          salt_score?: number | null;
          saturated_fat?: number | null;
          sidx?: number | null;
          sugar?: number | null;
          sugar_score?: number | null;
          title?: string;
          user_id?: string | null;
          visibility?: Database['public']['Enums']['visibility'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recipes_forked_from_fkey';
            columns: ['forked_from'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      tags: {
        Row: {
          category: Database['public']['Enums']['tag_category'];
          id: number;
          name: string;
        };
        Insert: {
          category: Database['public']['Enums']['tag_category'];
          id?: number;
          name: string;
        };
        Update: {
          category?: Database['public']['Enums']['tag_category'];
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      search_foods: {
        Args: { search_text: string };
        Returns: {
          calcium_mg: number | null;
          carbohydrates: number | null;
          choline_mg: number | null;
          copper_mg: number | null;
          created_at: string;
          density: number | null;
          ed: number | null;
          fat: number | null;
          fat_profile_score: number | null;
          fiber: number | null;
          fiber_score: number | null;
          folate_ug_dfe: number | null;
          gluten_free: boolean | null;
          hidx: number | null;
          id: number;
          iodine_ug: number | null;
          iron_mg: number | null;
          kcal: number | null;
          magnesium_mg: number | null;
          manganese_mg: number | null;
          measurements: string[];
          mnidx: number | null;
          mufas_total_mg: number | null;
          name: string;
          niacin_b3_mg: number | null;
          omega3_total_mg: number | null;
          omega6_total_mg: number | null;
          polyphenols_total_mg: number | null;
          potassium_mg: number | null;
          price: number | null;
          processing_level: number | null;
          protein: number | null;
          protein_score: number | null;
          riboflavin_b2_mg: number | null;
          salt: number | null;
          salt_score: number | null;
          saturated_fat: number | null;
          selenium_ug: number | null;
          sidx: number | null;
          sugar: number | null;
          sugar_score: number | null;
          thiamine_b1_mg: number | null;
          trans_fats_mg: number | null;
          unit_name: string | null;
          unit_weight: number | null;
          vegan: boolean | null;
          vegetarian: boolean | null;
          vitamin_a_ug_rae: number | null;
          vitamin_b12_ug: number | null;
          vitamin_b6_mg: number | null;
          vitamin_c_mg: number | null;
          vitamin_d_ug: number | null;
          vitamin_e_mg_alpha_te: number | null;
          vitamin_k_ug: number | null;
          zinc_mg: number | null;
        }[];
      };
      search_recipes: {
        Args: { search_text: string };
        Returns: {
          carbohydrates: number | null;
          created_at: string;
          difficulty: Database['public']['Enums']['difficulty'] | null;
          ed: number | null;
          effort: Database['public']['Enums']['effort'] | null;
          fat: number | null;
          fat_profile_score: number | null;
          fiber: number | null;
          fiber_score: number | null;
          forked_from: number | null;
          hidx: number | null;
          id: number;
          instructions: string[] | null;
          kcal: number | null;
          mnidx: number | null;
          picture: string | null;
          price: number | null;
          processing_level_score: number | null;
          protein: number | null;
          rating: number | null;
          salt: number | null;
          salt_score: number | null;
          saturated_fat: number | null;
          sidx: number | null;
          sugar: number | null;
          sugar_score: number | null;
          title: string;
          user_id: string | null;
          visibility: Database['public']['Enums']['visibility'] | null;
        }[];
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
    };
    Enums: {
      activity_type:
        | 'COMMENT_CREATION'
        | 'RECIPE_CREATION'
        | 'RATING_CREATION'
        | 'USER_CREATION'
        | 'FOOD_CREATION';
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      effort: 'LIGHT' | 'MODERATE' | 'HEAVY';
      Measurements: 'WEIGHT' | 'VOLUME' | 'PIECES';
      tag_category: 'GENERAL' | 'CUISINE' | 'COURSE' | 'FLAVOR';
      unit: 'G' | 'ML' | 'UNITS' | 'TSP' | 'TBSP';
      visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        'COMMENT_CREATION',
        'RECIPE_CREATION',
        'RATING_CREATION',
        'USER_CREATION',
        'FOOD_CREATION',
      ],
      difficulty: ['EASY', 'MEDIUM', 'HARD'],
      effort: ['LIGHT', 'MODERATE', 'HEAVY'],
      Measurements: ['WEIGHT', 'VOLUME', 'PIECES'],
      tag_category: ['GENERAL', 'CUISINE', 'COURSE', 'FLAVOR'],
      unit: ['G', 'ML', 'UNITS', 'TSP', 'TBSP'],
      visibility: ['PRIVATE', 'UNLISTED', 'PUBLIC'],
    },
  },
} as const;

export 
