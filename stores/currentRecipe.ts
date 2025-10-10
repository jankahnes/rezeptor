import type { Comment } from '~/types/types';

export const useRecipeStore = defineStore('recipe', () => {
  const recipe = ref<Recipe | null>(null);

  const editingRecipe = ref<ComputableRecipe | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const supabase = useSupabaseClient();
  const indexRecipes = ref<RecipeOverview[]>([]);
  const isEditingNew = ref(false);

  async function setIndexRecipes(recipes: RecipeOverview[]) {
    indexRecipes.value = recipes;
  }

  async function deleteRecipe(id: number) {
    const filtered: RecipeOverview[] = indexRecipes.value.filter(
      (recipe) => recipe.id !== id
    );
    indexRecipes.value = filtered;
  }

  async function setRecipe(newRecipe: Recipe) {
    recipe.value = newRecipe;
    isEditingNew.value = false;
  }

  async function setEditingRecipe(newRecipe: ComputableRecipe) {
    editingRecipe.value = newRecipe;
    isEditingNew.value = true;
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
      console.error('Failed to update rating:', e);
    }
  }

  return {
    recipe,
    editingRecipe,
    isLoading,
    error,
    indexRecipes,
    isEditingNew,
    deleteCommentById,
    addNewComment,
    editCommentById,
    updateRating,
    setRecipe,
    setIndexRecipes,
    setEditingRecipe,
    deleteRecipe,
  };
});
