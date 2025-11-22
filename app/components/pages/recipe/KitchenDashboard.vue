<template>
  <div class="action-card action-card-padding flex gap-4">
    <div class="flex flex-col gap-4 justify-between">
      <!-- Header -->
      <div class="flex-1 flex flex-col gap-2">
        <div
          class="bg-green-100 text-green-700 outline outline-green-200 px-3 py-1 rounded-xl text-lg font-semibold flex items-center gap-2"
        >
          <span class="material-symbols-outlined !text-xl leading-none"
            >check_circle</span
          >
          Fits your Diet
        </div>
        <div
          class="flex-1 w-full bg-primary-50 rounded-xl flex justify-center items-center"
        >
          <p>Nothing</p>
        </div>
      </div>
      <div class="flex gap-4">
        <button
          class="text-primary outline-2 outline-primary-200 rounded-xl p-2 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span class="material-symbols-outlined !text-xl leading-none"
            >insert_chart</span
          >
          Track
        </button>
        <button
          class="text-primary outline-2 outline-primary-200 rounded-xl p-2 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span class="material-symbols-outlined !text-xl leading-none"
            >track_changes</span
          >
          Do nothing
        </button>
      </div>
      <!-- Main Action Area -->
      <button
        class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl p-3 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
      >
        <span class="material-symbols-outlined !text-[28px] leading-none"
          >rocket_launch</span
        >
        <div class="flex flex-col items-start">
          <span class="font-semibold text-lg">Start Cook Mode</span>
        </div>
      </button>
    </div>
    <!-- Social Media Link -->
    <div
      class="basis-48 flex-shrink-0 relative"
      v-if="socialPicture"
    >
      <NuxtImg
        :src="socialPicture"
        class="w-48 aspect-9/16 rounded-4xl object-cover"
      />

      <div
        class="absolute inset-0 pointer-events-none flex flex-col justify-between items-start p-4 gap-1"
      >
        <p
          class="py-0.5 px-2 rounded-4xl flex items-center gap-1"
          :class="bgStyles[websiteName as keyof typeof bgStyles]"
        >
          <img
            :src="`/${websiteName}.webp`"
            class="leading-none"
            :class="iconStyles?.[websiteName as keyof typeof iconStyles]"
          />
          <span class="truncate text-[12px] leading-none">
            {{ capitalize(recipe.original_creator_channel_name) }}
          </span>
        </p>
        <p
          class="bg-primary text-white text-base font-bold rounded-4xl py-1 px-3 flex items-center gap-1"
        >
          <span class="material-symbols-outlined !text-xl leading-none">
            play_circle
          </span>
          Watch
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: Recipe;
}>();

const recipeStore = useRecipeStore();

const websiteName = computed(() => {
  if (!props.recipe.source) return '';
  const url = new URL(props.recipe.source);
  const parts = url.hostname.split('.');
  const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  return domain;
});

const iconStyles = {
  youtube: 'w-4 h-3 my-1',
  tiktok: 'w-5 h-5',
  instagram: 'w-4 h-4 my-0.5',
};
const bgStyles = {
  youtube: 'bg-red-200/80',
  instagram: 'bg-yellow-100/80',
  tiktok: 'bg-gray-200/80',
};

const socialPicture = ref<string | null>(null);
watchEffect(async () => {
  if (props.recipe.source_type === 'MEDIA') {
    socialPicture.value = await recipeStore.getSocialPicture(
      props.recipe.source ?? ''
    );
  }
});
</script>
