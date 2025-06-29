export default class RecipeLoader {
  supabase = useSupabase();
  id: number;
  recipe: RecipeProcessed = {} as RecipeProcessed;
  isLoading: boolean = false;

  constructor(id: number) {
    this.id = id;
  }

  async loadRecipeInfo() {
    const { data: recipeData, error: recipeError } = await this.supabase
      .from('recipes')
      .select('*')
      .eq('id', this.id)
      .single();

    if (recipeError) {
      throw new Error('Failed to load recipe');
    }

    if (recipeData) {
      this.recipe = recipeData as RecipeProcessed;
    }
  }

  async loadComments() {
    try {
      const fetchedComments = await getCommentsByRecipe(this.id);
      this.recipe.comments = fetchedComments;
    } catch (e) {
      throw new Error('Failed to load comments for recipe');
    }
  }

  async loadTags() {
    const { data: tagData, error: tagError } = await this.supabase
      .from('recipe_tags')
      .select('tag_id')
      .eq('recipe_id', this.id);

    if (tagError) {
      console.error('Failed to load tags:', tagError);
    } else {
      this.recipe.tags = tagData.map((tag) => tag.tag_id);
    }
  }

  async loadPictureUrl() {
    if (this.recipe.picture_ext) {
      const { data: publicUrlData } = this.supabase.storage
        .from('recipe')
        .getPublicUrl(`${this.id}.${this.recipe.picture_ext}`);

      this.recipe.picture_url = publicUrlData.publicUrl;
    }
  }

  async loadIngredients() {
    const { data: ingredientData, error: foodError } = await this.supabase
      .from('recipe_foods')
      .select(
        `
          amount,
          unit,
          food:foods (
            id, name, price, density, unit_weight, unit_name, measurements
          ),
          category
        `
      )
      .eq('recipe_id', this.id);
    if (foodError) {
      console.error('Failed to load ingredients:', foodError);
    } else {
      this.recipe.ingredients = ingredientData.map((row) => {
        const food = row.food;
        return {
          id: food.id,
          name: food.name,
          price: food.price,
          density: food.density,
          unit_weight: food.unit_weight,
          unit_name: food.unit_name,
          measurements: Array.isArray(food.measurements)
            ? food.measurements
            : [],
          category: row.category,
          amountInfo: [[row.amount, row.unit]],
          possibleUnits: getPossibleUnits(
            Array.isArray(food.measurements) ? food.measurements : []
          ),
          currentUnit: 0,
        };
      });
      for (const ingredient of this.recipe.ingredients) {
        fillForUnits(ingredient);
      }
    }
  }

  async loadRecipe(full: boolean) {
    this.isLoading = true;
    try {
      await this.loadRecipeInfo();
      if (full) {
        await Promise.all([
          this.loadPictureUrl(),
          this.loadComments(),
          this.loadTags(),
          this.loadIngredients(),
        ]);
      } else {
        await Promise.all([this.loadPictureUrl(), this.loadTags()]);
      }
    } catch (e) {
      throw new Error('Failed to load recipe');
    } finally {
      this.isLoading = false;
    }
  }
}
