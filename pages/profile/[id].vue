<template>
  <div class="sm:mx-10 mb-10">
    <div v-if="error" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-red-500">
        Error loading user profile: {{ error.message }}
      </p>
    </div>

    <Skeleton
      v-else-if="pending || !user"
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
        class="h-20 sm:h-40 w-full sm:p-6 p-4 sm:bg-primary sm:text-white rounded-[38px] rounded-b-none relative"
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
            class="button flex items-center justify-center p-1 text-primary"
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
          class="flex flex-col gap-6 mt-12 items-stretch"
        >
          <RecipeCardHorizontal
            :recipe="recipe"
            :hide-tags="true"
            v-for="recipe in user?.recipes"
            class="flex-1 text-xl sm:text-2xl w-full"
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

onMounted(() => {
  useHead({
    title: user.value?.username + ' | Rezeptor',
  });
});

const {
  data: user,
  pending,
  error,
} = useLazyAsyncData('user', () => getUser(supabase, { eq: { id: userID } }));
</script>

<style scoped></style>
