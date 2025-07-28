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
          <button class="button !bg-secondary flex items-center justify-center p-1">
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
            :hide-icon="true"
            buttonStyle="py-1 text-sm font-bold"
          ></FormsChoiceSlider>
        </div>
        <div
          v-if="selectedView == 'RECIPES'"
          class="flex flex-wrap gap-6 justify-center"
        >
          <RecipeCard
            :recipe="recipe"
            :hide-tags="true"
            v-for="recipe in user?.recipes"
            class="flex-1 aspect-2/3 text-2xl max-w-70 basis-80"
          />
        </div>
        <div v-if="selectedView == 'ACTIVITY'" class="w-full space-y-4">
          <FeedItem v-for="item in user?.activity" :feed-item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const choices: [string, string][] = [
  ['RECIPES', ''],
  ['ACTIVITY', ''],
  ['LIKES', ''],
  ['STATS', ''],
];
const selectedView = ref('RECIPES');
const route = useRoute();
const userID = route.params.id;
const auth = useAuthStore();
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
  const { data, pending, error } = await useUser({ eq: { id: userID } });
  if (data.value) {
    user.value = data.value;
  }
  loading.value = false;
}
</script>

<style scoped></style>
