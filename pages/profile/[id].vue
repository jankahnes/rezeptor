<template>
  <div class="sm:mx-10 mb-10">
    <!-- Error state -->
    <div v-if="error" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-red-500">
        Error loading user profile: {{ error.message }}
      </p>
    </div>

    <!-- Loading state -->
    <Skeleton
      v-else-if="pending || !user"
      class="max-w-200 shadow-xl rounded-[40px] z-0 min-h-200 mt-5 mx-auto"
    />

    <!-- User not found state -->
    <div v-else-if="!user" class="max-w-200 mt-5 mx-auto text-center">
      <p class="text-gray-500">User not found</p>
    </div>

    <!-- User data -->
    <div
      v-else
      class="max-w-200 sm:shadow-xl bg-main sm:rounded-[40px] z-0 min-h-200 mt-5 mx-auto"
    >
      <div
        class="h-28 sm:h-40 w-full p-6 bg-primary text-white rounded-[38px] rounded-b-none relative"
      >
        <Avatar :src="user.picture_url" class="absolute top-6 left-6 z-10 h-[120%]" />
        <div class="ml-38 sm:ml-52 mt-5 text-wrap">
          <h1 class="font-extrabold text-2xl sm:text-4xl">
            {{ user.username }}
          </h1>
          <p class="font-light text-sm">
            Joined {{ dateToString(user.created_at) }}
          </p>
        </div>
      </div>
      <div class="mx-auto w-full px-4 sm:w-[80%] pb-10">
        <div class="flex mt-18 mb-6 justify-between">
          <FormsChoiceSlider
            class=""
            v-model="selectedView"
            :choices="choices"
            :hide-icon="true"
            buttonStyle="py-2"
          ></FormsChoiceSlider>
        </div>
        <div
          v-if="selectedView == 'Recipes'"
          class="w-full grid gap-2 sm:gap-6 grid-cols-[repeat(auto-fit,160px)] sm:grid-cols-[repeat(auto-fit,200px)]"
        >
          <RecipeCard
            :recipe="recipe"
            v-for="recipe in user?.recipes"
            class="h-70 max-w-40 sm:max-w-50 sm:h-80 text-lg mx-auto"
          />
        </div>
        <div v-if="selectedView == 'Activity'" class="w-full space-y-4">
          <FeedItem v-for="item in user?.activity" :feed-item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const choices: [string, string][] = [
  ['Recipes', ''],
  ['Activity', ''],
  ['Likes', ''],
  ['Stats', ''],
];
const selectedView = ref('Recipes');
const route = useRoute();
const userID = route.params.id;

const {
  data: user,
  pending,
  error,
} = await useUser({ eq: { id: userID } });
</script>

<style scoped></style>
