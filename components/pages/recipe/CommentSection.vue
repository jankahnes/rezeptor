<template>
  <div class="gap-4">
    <div
      class="p-6 shadow-lg rounded-md border-2 relative bg-main flex flex-col items-center justify-center my-4 gap-1"
    >
      <div
        class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-1 bg-main rounded-full shadow-sm pin"
      ></div>
      <span class="text-bold text-2xl">Your Rating:</span
      ><FormsRatingField
        class="text-primary"
        v-model="userRating"
        @update:modelValue="updateRating"
        :select="true"
        :star-width="32"
        :star-height="32"
        :spacing="-2"
        :id="950"
      ></FormsRatingField>
    </div>
  </div>
  <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 w-full">
    <div
      v-if="!hasComment && auth.user"
      class="p-10 max-w-90 w-full shadow-lg rounded-md border-2 relative bg-main flex items-center justify-center h-max mx-auto"
    >
      <div
        class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-1 bg-main rounded-full shadow-sm pin"
      ></div>
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
      :key="index"
      :bgColor="pastelColors[index % pastelColors.length]"
      :isReply="false"
    ></PagesRecipeComment>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const editingComment = ref(false);
const newComment = ref('');
const pastelColors = [
  '#faeedd',
  '#e0f7fa',
  '#fde2e4',
  '#e4f1d0',
  '#e5e0ff',
  '#fff0f5',
];

const recipe = useCurrentRecipeStore();
const userRating = computed(
  () =>
    recipe.recipe?.comments?.find(
      (comment) => comment.user.id === auth.user?.id
    )?.rating
);

const hasComment = computed(() =>
  recipe.recipe?.comments?.some(
    (comment) => !comment.replying_to && comment.user.id === auth.user?.id
  )
);

function updateRating(rating: number) {
  if (!auth.user) {
    navigateTo('/login');
  } else {
    recipe.updateRating(rating, auth.user.id);
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
  if (auth.user) {
    recipe.addNewComment({
      user: auth.user,
      content: newComment.value,
    });
    newComment.value = '';
    editingComment.value = false;
  }
}
</script>

<style scoped></style>
