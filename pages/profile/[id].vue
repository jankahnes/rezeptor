<template>
  <div class="sm:mx-10 mb-10">
    <div v-if="error" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-red-500">
        Error loading user profile: {{ error.message }}
      </p>
    </div>

    <Skeleton
      v-else-if="loading || !user"
      class="max-w-200 shadow-xl rounded-[40px] z-0 min-h-200 mt-5 mx-auto"
    />

    <div v-else-if="!user" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-gray-500">User not found</p>
    </div>

    <div
      v-else
      class="max-w-200 sm:shadow-xl bg-main sm:rounded-[40px] z-0 min-h-200 mt-5 mx-auto"
    >
      <div
        class="h-28 sm:h-40 w-full p-6 bg-primary text-white rounded-[38px] rounded-b-none relative"
      >
        <Avatar :user="user" class="absolute top-6 left-6 z-10 h-[120%]" />
        <div class="ml-38 sm:ml-52 mt-5 text-wrap">
          <h1 class="font-extrabold text-2xl sm:text-4xl">
            {{ user.username }}
          </h1>
          <p class="font-light text-sm">
            Joined {{ dateToString(user.created_at) }}
          </p>
        </div>
        <NuxtLink
          v-if="auth.user?.id == user.id"
          to="/account"
          class="flex justify-end"
        >
          <button
            class="button !bg-secondary flex items-center justify-center p-1"
          >
            <span class="material-symbols-outlined"> settings </span>
          </button>
        </NuxtLink>
      </div>
      <div class="mx-auto w-full px-4 sm:w-[80%] pb-10">
        <div class="flex mt-18 mb-6 justify-between">
          <FormsChoiceSlider
            class=""
            v-model="selectedView"
            :choices="choices"
            buttonStyle="py-1 text-sm font-bold"
          ></FormsChoiceSlider>
        </div>
        <div
          v-if="selectedView == 'recipes'"
          class="flex flex-col gap-6 justify-center mt-12"
        >
          <RecipeCard
            :recipe="recipe"
            :hide-tags="true"
            :horizontal="true"
            v-for="recipe in user?.recipes"
            class="flex-1 text-2xl"
          />
        </div>
        <div v-if="selectedView == 'activity'" class="w-full space-y-4">
          <FeedItem v-for="item in user?.activity" :feed-item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const choices: { value: string; displayName: string }[] = [
  { value: 'recipes', displayName: 'Recipes' },
  { value: 'activity', displayName: 'Activity' },
  { value: 'likes', displayName: 'Likes' },
  { value: 'stats', displayName: 'Stats' },
];
const selectedView = ref('recipes');
const route = useRoute();
const userID = route.params.id;
const auth = useAuthStore();
const supabase = useSupabaseClient();
const user = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(() => {
  useHead({
    title: user.value?.username + ' | Rezeptor',
  });
});

if (auth.user?.id == userID) {
  user.value = auth.user;
  loading.value = false;
} else {
  const { data, pending, error } = useAsyncData('user', () =>
    getUserPartial(supabase, { eq: { id: userID } })
  );
  watchEffect(() => {
    if (data.value) {
      user.value = data.value;
    }
    loading.value = false;
  });
}
</script>

<style scoped></style>
