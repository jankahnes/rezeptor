<template>
  <div
    v-if="!user"
    class="rounded-[25%] bg-main shadow-md flex items-center justify-center aspect-square"
  >
    <span class="material-symbols-outlined text-primary !text-[600%]">
      account_circle
    </span>
  </div>
  <img
    v-else-if="user.picture_url"
    class="rounded-[25%] aspect-square shadow-md"
    :src="user.picture_url"
  />
  <div
    v-else-if="user.username"
    class="rounded-[25%] bg-main shadow-md flex items-center justify-center aspect-square p-2"
  >
    <span class="font-semibold text-primary text-[100%]">
      {{ user.username.slice(0, 2).toUpperCase() }}
    </span>
  </div>
  <div
    v-else
    class="rounded-[25%] bg-main shadow-md flex items-center justify-center aspect-square"
  >
    <span class="material-symbols-outlined text-primary !text-[600%]">
      account_circle
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: UserProcessed;
}>();
</script>
