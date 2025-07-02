export const useRecipeStore = defineStore('recipe', () => {
  const recipe = ref<RecipeProcessed | null>(null);
  const currentRecipeId = ref<number | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const supabase = useSupabaseClient();
  const indexRecipes = ref<RecipeProcessed[]>([]);

  async function setIndexRecipes(recipes: RecipeProcessed[]) {
    indexRecipes.value = recipes;
  }

  async function setRecipe(newRecipe: RecipeProcessed) {
    recipe.value = newRecipe;
  }

  async function convertToEditable() {
    if (!recipe.value) {
      return {};
    }
    recipe.value.ingredients_pre = { servingSize: 1, ingredients: [] };
    const ingredientIds = recipe.value.ingredients.map(
      (ingredient) => ingredient.id
    );
    const foodsFromDb = await getFoods(supabase, { in: { id: ingredientIds } });
    for (const ingredient of recipe.value.ingredients) {
      const matchingFood = foodsFromDb.find(
        (food) => food.id === ingredient.id
      );
      const mergedIngredient = {
        ...matchingFood,
        ...ingredient,
        amount: ingredient.amountInfo[0][0],
        unit: ingredient.amountInfo[0][1],
      };
      mergedIngredient.possibleUnits = mergedIngredient.possibleUnits.map(
        (item) =>
          item === 'UNITS'
            ? pluralize(matchingFood.unit_name).toLowerCase()
            : item.toLowerCase()
      );
      mergedIngredient.unit =
        mergedIngredient.unit === 'UNITS'
          ? pluralize(matchingFood.unit_name).toLowerCase()
          : mergedIngredient.unit.toLowerCase();
      let foundCategory = recipe.value.ingredients_pre.ingredients.find(
        (category) => category.categoryName == ingredient.category
      );
      if (!foundCategory) {
        foundCategory = {
          categoryName: ingredient.category,
          searchQuery: null,
          searchResults: [],
          ingredients: [],
        };
        recipe.value.ingredients_pre.ingredients.push(foundCategory);
      }
      foundCategory.ingredients.push(mergedIngredient);
    }
    return recipe.value;
  }

  async function deleteCommentById(commentId: number) {
    if (!recipe.value) return;

    const removeFromArray = (commentsArray: Comment[]): Comment | null => {
      const index = commentsArray.findIndex((c) => c.id === commentId);
      if (index !== -1) {
        const foundComment = commentsArray[index];
        commentsArray.splice(index, 1);
        return foundComment;
      }
      for (const comment of commentsArray) {
        if (comment.replies?.length) {
          const found = removeFromArray(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };

    try {
      if (recipe.value.comments) {
        const removedComment = removeFromArray(recipe.value.comments);
        if (removedComment) {
          await deleteComment(supabase, removedComment);
        } else {
          throw new Error('Comment not found with id: ' + commentId);
        }
      }
    } catch (e) {
      error.value = e.message;
      console.error('Failed to delete comment:', e);
    }
  }

  async function addNewComment(comment: Omit<Comment, 'id' | 'created_at'>) {
    if (!recipe.value) return;

    try {
      const id = await addComment(supabase, {
        user_id: comment.user.id,
        content: comment.content,
        recipe_id: recipe.value.id,
        replying_to: comment.replying_to,
      });

      const newComment = {
        ...comment,
        id,
        created_at: new Date().toISOString(),
      };

      if (comment.replying_to) {
        const parentComment = findComment(comment.replying_to);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(newComment);
        }
      } else {
        recipe.value.comments.push(newComment);
      }
    } catch (e) {
      error.value = e.message;
      console.error('Failed to add comment:', e);
    }
  }

  function findComment(commentId: number): Comment | null {
    if (!recipe.value) return null;

    const findInArray = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies?.length) {
          const found = findInArray(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };

    return findInArray(recipe.value.comments);
  }

  async function editCommentById(id: number, content: string) {
    const foundComment = findComment(id);
    if (foundComment) {
      foundComment.content = content;
    }
    await editComment(supabase, id, content);
  }

  async function updateRating(rating: number, userId: string) {
    if (!recipe.value) return;
    try {
      for (const comment of recipe.value?.comments || []) {
        if (comment.user.id === userId) {
          comment.rating = rating;
        }
      }
    } catch (e) {
      error.value = e.message;
      console.error('Failed to update rating:', e);
    }
  }

  return {
    isLoading,
    error,
    deleteCommentById,
    addNewComment,
    editCommentById,
    recipe,
    updateRating,
    convertToEditable,
    setRecipe,
    setIndexRecipes,
    indexRecipes,
  };
});
