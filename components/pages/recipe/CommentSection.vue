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
          @input="autoResize($event)"
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
            <span class="material-symbols-outlined"> edit </span>
          </button>
        </div>
      </div>
    </div>
    <div class="m-6 space-y-4">
      <div v-for="comment in comments" :key="comment.id">
        <PagesRecipeComment :comment="comment" />
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
  hasRecord.value = true;

  if (userCommentInput.value && !editing.value) {
    try {
      addComment({
        user_id: auth.user.id,
        replying_to: null,
        content: userCommentInput.value,
        recipe_id: props.recipeID,
      });
    } catch (e) {
      throw new Error(String(e)); //temp
    }
  }
  if (userRatingInput.value && !editing.value) {
    try {
      addRating({
        user_id: auth.user.id,
        rating: userRatingInput.value,
        recipe_id: props.recipeID,
      });
    } catch (e) {
      throw new Error(String(e)); //temp
    }
  }
}

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

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = '64px'; // Reset height
  if (textarea.scrollHeight > 64) {
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  } else {
    textarea.style.height = 64 + 'px';
  }
}
</script>

<style scoped></style>
