<template>
  <div
    v-if="!user"
    class="rounded-[25%] bg-main shadow-md flex items-center justify-center aspect-square"
  >
    <span class="material-symbols-outlined text-primary !text-[600%]">
      account_circle
    </span>
  </div>
  <NuxtImg
    v-else-if="user.picture"
    class="rounded-[25%] aspect-square shadow-md"
    :src="user.picture"
  />
  <div
    v-else-if="user.username"
    class="rounded-[25%] bg-main shadow-md flex items-center justify-center aspect-square p-2 h-full"
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
