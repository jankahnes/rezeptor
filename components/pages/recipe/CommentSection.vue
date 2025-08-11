<template>
  <div class="flex flex-col gap-6 mt-4 items-start p-2 md:p-6" ref="root">
    <div class="flex flex-col items-start">
      <div class="!pb-3">
        <div class="py-1 px-4 bg-primary text-white rounded-lg flex">
          <h2 class="text-lg font-bold">WHAT OTHERS SAY</h2>
        </div>
      </div>
      <p class="text-gray-600 ml-1 text-sm font-light">
        {{ recipe.recipe?.comments?.length }}
        {{ recipe.recipe?.comments?.length === 1 ? 'comment' : 'comments' }}
      </p>
    </div>
    <div class="relative flex flex-col gap-1 my-4">
      <span class="text-bold text-xl">Your Rating:</span
      ><FormsRatingField
        class="text-primary"
        v-model="userRating"
        @update:model-value="updateRating"
        :select="true"
        :star-width="26"
        :star-height="26"
        :spacing="-2"
        :id="950 + id"
      ></FormsRatingField>
    </div>
    <div class="flex flex-wrap gap-4 w-full gap-y-8">
      <div
        v-if="!hasComment && auth.user"
        class="p-2 max-w-90 w-full relative bg-main flex items-center justify-center h-max mx-auto"
      >
        <span
          v-if="!editingComment"
          class="material-symbols-outlined !text-3xl w-full h-full text-center cursor-pointer"
          @click="onClickNewComment"
        >
          add
        </span>
        <div class="w-full" v-else>
          <textarea
            v-model="newComment"
            v-auto-resize
            class="w-full p-2 rounded-md border-2 border-gray-300 border-dashed resize-none scrollbar-hide bg-white overflow-hidden h-auto"
            rows="1"
          ></textarea>
          <div class="flex justify-between mt-1">
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
              @click="editingComment = false"
            >
              Cancel
            </button>
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="submitComment"
              :disabled="!newComment"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <PagesRecipeComment
        v-for="(comment, index) in recipe.recipe?.comments"
        :comment="comment"
        :id="id"
        :key="index + id"
        :isReply="false"
      ></PagesRecipeComment>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: number;
}>();

const root = ref<HTMLElement | null>(null);

const auth = useAuthStore();
const editingComment = ref(false);
const newComment = ref('');
const supabase = useSupabaseClient();

const recipe = useRecipeStore();

const userRating = ref(0);

const unsubscribeAuth = ref<(() => void) | null>(null);

onMounted(() => {
  if (!unsubscribeAuth.value) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id && recipe.recipe?.id) {
        fetchRating();
      }
      if (event === 'SIGNED_OUT') {
        userRating.value = 0;
      }
    });

    unsubscribeAuth.value = () => subscription.unsubscribe();
  }
});

onUnmounted(() => {
  if (unsubscribeAuth.value) {
    unsubscribeAuth.value();
    unsubscribeAuth.value = null;
  }
});

async function fetchRating() {
  const user = auth.user as any;
  if (user?.id && recipe.recipe?.id) {
    const rating = expectSingleOrNull(
      await getRatings(supabase, {
        eq: {
          user_id: user.id,
          recipe_id: recipe.recipe.id,
        },
      })
    );
    userRating.value = rating?.rating ?? 0;
  }
}

fetchRating();

const hasComment = computed(() => {
  const user = auth.user as any;
  return recipe.recipe?.comments?.some(
    (comment) => !comment.replying_to && comment.user.id === user?.id
  );
});

function updateRating(rating: number) {
  const user = auth.user as any;
  if (!user) {
    navigateTo('/login');
  } else if (recipe.recipe?.id) {
    upsertRating(supabase, rating, user.id, recipe.recipe.id);
    recipe.updateRating(rating, user.id);
  }
}

function onClickNewComment() {
  if (auth.user) {
    editingComment.value = true;
  } else {
    navigateTo('/login');
  }
}

function submitComment() {
  const user = auth.user as any;
  if (user && recipe.recipe?.id) {
    recipe.addNewComment({
      user: user,
      content: newComment.value,
      recipe_id: recipe.recipe.id,
      replying_to: null,
    });
    newComment.value = '';
    editingComment.value = false;
  }
}

function scrollIntoView() {
  root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

defineExpose({ scrollIntoView });
</script>

<style scoped></style>
