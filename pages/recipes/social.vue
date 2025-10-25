<template>
  <div class="flex flex-wrap gap-4 justify-center mt-10">
    <RecipeCardSocialMedia v-for="recipe in results" :key="recipe.id" :recipe="recipe" class="max-h-60
    max-w-240 basis-150"/>
    <div ref="sentinelElement" v-if="isLoading || hasMoreRecipes" class="h-120">
      <Skeleton class="h-120" />
    </div>
    <Skeleton
      v-if="isLoading || hasMoreRecipes"
      v-for="i in 10"
      :key="i"
      class="h-120"
    />
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient<Database>();
const RECIPES_PER_PAGE = 12;
const isLoading = ref(false);
const hasMoreRecipes = ref(true);
const currentOffset = ref(0);
const sentinelElement = ref<HTMLElement | null>(null);

const results = ref<RecipeOverview[]>([]);

async function loadMoreRecipes() {
  if (isLoading.value || !hasMoreRecipes.value) return;
  isLoading.value = true;
  try {
    const newRecipes = await getRecipeOverviews(supabase, {
      orderBy: { column: 'created_at', ascending: false },
      eq: { source_type: 'MEDIA' },
      range: {
        from: currentOffset.value,
        to: currentOffset.value + RECIPES_PER_PAGE - 1,
      },
    });

    if (newRecipes.length < RECIPES_PER_PAGE) {
      hasMoreRecipes.value = false;
    }

    // @ts-ignore - TypeScript inference issue with deeply nested types
    results.value = [...results.value, ...newRecipes];
    currentOffset.value += RECIPES_PER_PAGE;
  } catch (error) {
    console.error('Error loading recipes:', error);
  } finally {
    isLoading.value = false;
  }
}

async function refresh() {
  currentOffset.value = 0;
  results.value = [];
  hasMoreRecipes.value = true;
  await loadMoreRecipes();
}
const debouncedRefresh = debounce(() => refresh(), 1000);

let observer: IntersectionObserver | null = null;

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

onMounted(async () => {
  await refresh();
  await nextTick();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading.value && hasMoreRecipes.value) {
          loadMoreRecipes();
        }
      });
    },
    {
      rootMargin: '100px',
    }
  );

  if (sentinelElement.value) {
    observer.observe(sentinelElement.value);
  }
});
</script>

<style scoped></style>
