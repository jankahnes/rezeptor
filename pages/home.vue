<template>
  <div class="p-10 space-y-10 text-2xl">
    <h1 class="text-4xl font-bold">
      Welcome back, {{ auth?.user?.username }}
    </h1>
    <div class="text-" v-if="recipesByUser.length > 0">Own Recipes ></div>
    <div class="flex gap-4">
      <RecipeCard v-for="recipe in recipesByUser" :recipe="recipe" />
    </div>
    <div class="text-">Saved Recipes ></div>
    <div class="flex gap-4"></div>
    <div class="text-">Recommendations ></div>
    <div class="flex gap-4"></div>
    <div class="text-">Feed ></div>
    <div class="flex gap-4 items-center">
      <FeedItem v-for="item in feedItems" :feedItem="item" />
    </div>
    <div class="text-">
      Don't know what to cook? Tell us what you have at home:
    </div>
    <div class="flex gap-4"></div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const loading = ref(false);
const recipesByUser = ref([]);
const feedItems = ref([]);
const supabase = useSupabase()

watchEffect(() => {
  if (!auth.user && auth.userFetched) navigateTo('/');
});

const loadAll = async () => {
  const user = auth.user;
  if (!user) return;
  recipesByUser.value = await getRecipesByUser(auth.user.id, 3);
  feedItems.value = await getFeedItems(5);
  for (const result of recipesByUser.value) {
    result.tags = [];
    for (const tag of result.recipe_tags) {
      result.tags.push(tag.tag_id);
    }
  }
  for (const result of recipesByUser.value) {
    if (result.picture_ext) {
      const { data: publicUrlData } = supabase.storage
        .from('recipe')
        .getPublicUrl(`${result.id}.${result.picture_ext}`);

      result.imageUrl = publicUrlData.publicUrl;
    }
  }
};
onMounted(() => {
  loadAll();
});

watch(
  () => auth.user,
  () => {
    loadAll();
  }
);
</script>

<style scoped></style>
