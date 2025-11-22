<template>
  <div class="sm:mx-10 mb-10">
    <div v-if="!loading && !user" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-gray-500">User not found</p>
    </div>
    <div class="flex gap-4 w-full flex-1 mt-22">
      <FormsChoiceSlider
        :choices="choices"
        v-model="selectedView"
        vertical
        class="min-w-30 flex-[0.2] max-w-45 self-start sticky top-22 left-0"
      />
      <Transition name="loaded-content">
        <section class="flex-1" v-if="!loading && user">
          <template v-if="selectedView === 'recipes'">
            <div class="flex-wrap gap-4 sm:gap-6 hidden md:flex justify-center">
              <RecipeCard
                v-if="user.recipes"
                :recipe="recipe"
                class="min-w-80 basis-80 max-w-90 flex-1 min-h-50 text-[30px]"
                v-for="recipe in user.recipes"
                :key="recipe.id"
              />
            </div>
            <div class="flex flex-col gap-4 md:hidden justify-items-stretch">
              <RecipeCardHorizontal
                :recipe="recipe"
                class=""
                v-for="recipe in user.recipes"
                :key="recipe.id"
              />
            </div>
          </template>
          <template v-if="selectedView === 'activity'">
            <div class="flex flex-col gap-4">
              <FeedItem
                v-for="activity in user.activity"
                :key="activity.id"
                :feed-item="activity"
              />
            </div>
          </template>
          <template v-if="selectedView === 'meals'"> </template>
        </section>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const choices: { value: string; displayName: string }[] = [
  { value: 'recipes', displayName: '🛎️ Recipes' },
  { value: 'activity', displayName: '🎯 Activity' },
  { value: 'meals', displayName: '🍽️ Meals' },
  { value: 'likes', displayName: '👍 Likes' },
  { value: 'stats', displayName: '📊 Stats' },
  { value: 'settings', displayName: '⚙️ Settings' },
  { value: 'logout', displayName: '🚪 Log Out' },
];
const selectedView = ref('recipes');
const route = useRoute();
const userID = route.params.id;
const auth = useAuthStore();
const supabase = useSupabaseClient<Database>();
const user = ref<FullUser | null>(null);
const loading = ref(true);

watchEffect(() => {
  if (selectedView.value === 'logout') {
    auth.signOut();
    navigateTo('/');
    return;
  }
});

onMounted(async () => {
  user.value = await getUser(supabase, { eq: { id: userID } });
  loading.value = false;
  useHead({
    title: user.value?.username ?? 'User' + ' | Rezeptor',
  });
});
</script>

<style scoped></style>
