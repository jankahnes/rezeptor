<template>
  <NuxtLink class="border p-3 text-base" :to="getLinkTarget()">
    <div v-if="feedItem?.type === 'COMMENT_CREATION'" class="">
      <p>{{ feedItem?.username }}</p>
      <p class="font-light text-[14px]">commented on {{ feedItem?.title }}</p>
      <p class="my-2">"{{ feedItem?.content }}"</p>
      <div class="flex justify-end items-center w-full font-light text-xs">
        {{ timeAgo(feedItem?.created_at) }}
      </div>
    </div>
    <div v-else-if="feedItem?.type === 'RECIPE_CREATION'" class="">
      <p>{{ feedItem?.username }}</p>
      <p class="font-light text-[14px]">created a new recipe</p>
      <p class="font-bold my-2">"{{ feedItem?.title }}"</p>
      <div class="flex justify-end items-center w-full font-light text-xs">
        {{ timeAgo(feedItem?.created_at) }}
      </div>
    </div>
    <div v-else-if="feedItem?.type === 'RATING_CREATION'" class="">
      <p>{{ feedItem?.username }}</p>
      <p class="font-light text-[14px]">rated {{ feedItem?.title }}</p>
      <FormsRatingField
        :model-value="feedItem.rating"
        :select="false"
        class="my-2"
      />
      <div class="flex justify-end items-center w-full font-light text-xs">
        {{ timeAgo(feedItem?.created_at) }}
      </div>
    </div>
    <div v-else-if="feedItem?.type === 'USER_CREATION'" class="">
      <p class="font-bold">{{ feedItem?.username }}</p>
      <p>has joined the community.</p>
      <div class="flex justify-end items-center w-full font-light text-xs mt-2">
        {{ timeAgo(feedItem?.created_at) }}
      </div>
    </div>
    <div v-else-if="feedItem?.type === 'FOOD_CREATION'" class="">
      <p>{{ feedItem?.name }}</p>
      <p>has been added to the Foods Database.</p>
      <div class="flex justify-end items-center w-full font-light text-xs mt-2">
        {{ timeAgo(feedItem?.created_at) }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({ feedItem: Object });

function getLinkTarget() {
  if (
    ['COMMENT_CREATION', 'RATING_CREATION', 'RECIPE_CREATION'].includes(
      props.feedItem?.type
    )
  ) {
    return '/recipe/' + props.feedItem?.recipe_id;
  } else if (props.feedItem?.type === 'USER_CREATION') {
    return '/profile/' + props.feedItem?.user_id;
  } else if (props.feedItem?.type === 'FOOD_CREATION') {
    return '/foods/' + props.feedItem?.food_id;
  }
}
</script>

<style scoped></style>
