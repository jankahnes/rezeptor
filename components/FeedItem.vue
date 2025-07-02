<template>
  <NuxtLink
    :to="getLinkTarget()"
    class="flex items-start p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 space-x-4"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <Avatar
        v-if="feedItem.user"
        :user="feedItem.user"
        class="w-10 h-10"
      />
      <div
        v-else-if="feedItem.type === 'FOOD_CREATION'"
        class="w-10 h-10 text-green-500"
      >
        <span class="material-symbols-outlined">add</span>
      </div>
      <div v-else class="w-10 h-10">
        <span class="material-symbols-outlined">notifications</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold">
          <template v-if="feedItem.user">
            {{ feedItem.user.username }}
          </template>
          <template v-else-if="feedItem.food"> New Food Added </template>
        </div>
        <time :datetime="feedItem.created_at" class="text-xs">
          {{ timeAgo(feedItem.created_at) }}
        </time>
      </div>

      <div class="mt-1 text-sm">
        <template v-if="feedItem.type === 'COMMENT_CREATION'">
          commented on
          <span class="font-medium">{{ feedItem.comment.recipe.title }}</span>
          <p class="mt-2 italic">"{{ feedItem.comment.content }}"</p>
        </template>

        <template v-else-if="feedItem.type === 'RECIPE_CREATION'">
          created a new recipe
          <h4 class="mt-2 font-bold">
            {{ feedItem.recipe.title }}
          </h4>
        </template>

        <template v-else-if="feedItem.type === 'RATING_CREATION'">
          rated
          <span class="font-medium">{{ feedItem.rating.recipe.title }}</span>
          <div class="mt-2">
            <FormsRatingField v-model="feedItem.rating.rating" :select="false" :id="800" />
          </div>
        </template>

        <template v-else-if="feedItem.type === 'USER_CREATION'">
          joined the community 🎉
        </template>

        <template v-else-if="feedItem.type === 'FOOD_CREATION'">
          added <span class="font-medium">{{ feedItem.food.name }}</span> to the
          database
        </template>
      </div>
    </div>

    <!-- Optional Thumbnail -->
    <div v-if="feedItem.recipe?.thumbnailUrl" class="flex-shrink-0">
      <img
        :src="feedItem.recipe.thumbnailUrl"
        alt="Recipe Thumbnail"
        class="w-16 h-16 object-cover rounded-lg"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ feedItem: ActivityProcessed }>();

function getLinkTarget() {
  if (props.feedItem?.type === 'COMMENT_CREATION') {
    return '/recipe/' + props.feedItem?.comment?.recipe?.id;
  } else if (props.feedItem?.type === 'RATING_CREATION') {
    return '/recipe/' + props.feedItem?.rating?.recipe?.id;
  } else if (props.feedItem?.type === 'RECIPE_CREATION') {
    return '/recipe/' + props.feedItem?.recipe?.id;
  } else if (props.feedItem?.type === 'USER_CREATION') {
    return '/profile/' + props.feedItem?.user_id;
  } else if (props.feedItem?.type === 'FOOD_CREATION') {
    return '/foods/' + props.feedItem?.food_id;
  }
}
</script>

<style scoped></style>
