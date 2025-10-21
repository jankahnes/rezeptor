<template>
  <NuxtLink
    :to="getLinkTarget()"
    class="flex items-center p-4 rounded-2xl shadow-sm space-x-4"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0 flex items-center justify-center min-w-10">
      <div v-if="feedItem.recipe?.picture" class="flex-shrink-0">
        <NuxtImg
          :src="feedItem.recipe.picture"
          alt="Recipe Thumbnail"
          class="w-16 h-16 object-cover rounded-lg"
        />
      </div>
      <Avatar
        v-else-if="feedItem.user && feedItem.user.username"
        :user="feedItem.user"
        class="w-10 h-10"
      />
      <div
        v-else-if="
          feedItem.type === 'FOOD_CREATION' ||
          feedItem.type === 'RECIPE_CREATION'
        "
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
            {{ feedItem.user.username ?? "New User" }}
          </template>
          <template v-else-if="feedItem.food"> New Food Added </template>
          <template v-else-if="feedItem.recipe"> New Recipe Added </template>
        </div>
        <time :datetime="feedItem.created_at" class="text-xs">
          {{ timeAgo(feedItem.created_at) }}
        </time>
      </div>

      <div class="mt-1 text-sm">
        <template v-if="feedItem.type === 'COMMENT_CREATION'">
          commented on
          <span class="font-medium">{{
            feedItem!.comment!.recipe!.title
          }}</span>
          <p class="mt-2 italic">"{{ feedItem!.comment!.content }}"</p>
        </template>

        <template v-else-if="feedItem.type === 'RECIPE_CREATION'">
          <span v-if="feedItem.user && feedItem.user.username"
            >created a new recipe</span
          >
          <h4 class="mt-2 font-bold">
            {{ feedItem.recipe!.title }}
          </h4>
        </template>

        <template v-else-if="feedItem.type === 'RATING_CREATION'">
          rated
          <span class="font-medium">{{ feedItem.rating!.recipe!.title }}</span>
          <div class="mt-2">
            <FormsRatingField
              v-model="feedItem.rating!.rating"
              :select="false"
              :id="800"
            />
          </div>
        </template>

        <template v-else-if="feedItem.type === 'USER_CREATION'">
          joined the community 🎉
        </template>

        <template v-else-if="feedItem.type === 'FOOD_CREATION'">
          added <span class="font-medium">{{ feedItem.food!.name }}</span> to
          the database
        </template>
      </div>
    </div>

    <!-- Optional Thumbnail -->
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ feedItem: Activity }>();

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
    return '/foods/' + props.feedItem?.food_name_id;
  }
}
</script>

<style scoped></style>
