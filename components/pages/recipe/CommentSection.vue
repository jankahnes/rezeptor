<template>
  <div class="pt-4 md:m-10 md:p-10 w-full md:w-[90%]">
    <div
      class="w-full flex gap-10 bg-[#8a7ca92a] p-3 rounded-xl"
      v-if="auth.user"
    >
      <div
        class="flex flex-col items-center justify-center text-sm gap-2 text-center mt-2"
      >
        <img :src="auth?.user?.picture_url" class="w-20 h-20" />
        <p>{{ auth?.user?.username }}</p>
      </div>
      <div class="flex-1" v-if="!hasRecord || editing">
        <p>Share your opinion on this recipe</p>
        <FormsRatingField
          v-model="userRatingInput"
          :select="true"
          :star-size="18"
          :id="200"
        ></FormsRatingField>
        <textarea
          v-model="userCommentInput"
          class="block bg-none mt-2 rounded-sm h-16 p-1 border resize-none overflow-hidden leading-snug w-full sm:w-[75%]"
          rows="1"
          @input="autoResize($event, 64)"
        ></textarea>
        <button
          v-if="editing"
          @click="editing = false"
          class="inline-block bg-white border-2 border-black px-2 py-0 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50 mt-2 mr-2"
        >
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="
            !(userCommentInput || userRatingInput) ||
            (userComment === userCommentInput && userRating === userRatingInput)
          "
          class="inline-block bg-white border-2 border-black px-2 py-0 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50 mt-2"
        >
          Submit
        </button>
      </div>
      <div class="flex-1" v-else>
        <p>Your thoughts:</p>
        <FormsRatingField
          v-model="userRating"
          :select="false"
          :star-size="18"
          :id="250"
        ></FormsRatingField>
        <div
          class="flex justify-between bg-none mt-2 rounded-sm p-1 border-2 w-full sm:w-[75%]"
        >
          {{ userComment
          }}<button
            @click="editing = true"
            class="inline-block px-2 py-0 font-bold mt-2 items-center justify-center"
          >
            <span v-if="userComment" class="material-symbols-outlined">
              edit
            </span>
            <span v-else class="material-symbols-outlined"> add </span>
          </button>
        </div>
      </div>
    </div>
    <div class="m-6 space-y-4">
      <div v-for="comment in comments" :key="comment.id">
        <PagesRecipeComment
          :comment="comment"
          :removeFunction="removeCommentLocal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const userRatingInput = ref<null | number>(null);
const userCommentInput = ref<null | string>(null);
const userRating = ref<null | number>(null);
const userComment = ref<null | string>(null);
const hasRecord = ref(false);
const editing = ref(false);
const props = defineProps({ comments: Array<Object>, recipeID: Number });

function submit() {
  userRating.value = userRatingInput.value;
  userComment.value = userCommentInput.value;
  console.log('called');
  if (userCommentInput.value) {
    try {
      addComment(
        {
          user_id: auth.user.id,
          replying_to: null,
          content: userCommentInput.value,
          recipe_id: props.recipeID,
        },
        hasRecord.value
      );
    } catch (e) {
      throw new Error(String(e));
    }
  }
  if (userRatingInput.value) {
    try {
      addRating(
        {
          user_id: auth.user.id,
          rating: userRatingInput.value,
          recipe_id: props.recipeID,
        },
        hasRecord.value
      );
    } catch (e) {
      throw new Error(String(e));
    }
  }
  if (editing.value) {
    props.comments?.forEach((comment) => {
      if (comment.user.id == auth.user.id && !comment.replying_to) {
        comment.content = userCommentInput.value;
        comment.rating = userRatingInput.value;
      }
    });
  }
  hasRecord.value = true;
  editing.value = false;
}

const removeCommentLocal = (id) => {
  props.comments.forEach((comment) => {
    comment.replies = comment.replies.filter((reply) => reply.id !== id);
  });

  const index = props.comments.findIndex((comment) => comment.id === id);
  if (index !== -1) {
    props.comments.splice(index, 1);
  }
};

const loadUserRecord = async () => {
  const user = auth.user;
  if (!user) return;
  const { rating, comment } = await getRecordByUser(props.recipeID, user.id);
  userRating.value = rating;
  userRatingInput.value = rating;
  userComment.value = comment;
  userCommentInput.value = comment;
  if (rating || comment) {
    hasRecord.value = true;
  }
};

onMounted(() => {
  loadUserRecord();
});

watch(
  () => auth.user,
  () => {
    loadUserRecord();
  }
);
</script>

<style scoped></style>
