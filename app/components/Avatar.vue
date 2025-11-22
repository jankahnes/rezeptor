<template>
  <NuxtLink :to="'/profile/' + user?.id" active-class="[&>*]:shadow-none!">
    <NuxtImg
      v-if="user?.picture"
      class="rounded-full aspect-square shadow-md transition-all duration-300"
      :class="halo ? 'shadow-[0_0_10px_0_var(--color-primary)]!' : ''"
      :src="user.picture"
    />
    <div
      v-else-if="user?.username"
      class="rounded-full bg-primary-10 shadow-md flex items-center justify-center aspect-square p-2 h-full transition-all duration-300"
      :class="halo ? 'shadow-[0_0_10px_0_var(--color-primary)]!' : ''"
    >
      <span class="font-semibold text-primary text-[100%]">
        {{ user.username.slice(0, 2).toUpperCase() }}
      </span>
    </div>
    <div
      v-else
      class="rounded-full bg-primary-10 shadow-md flex items-center justify-center aspect-square overflow-hidden transition-all duration-300"
      :class="halo ? 'shadow-[0_0_10px_0_var(--color-primary)]!' : ''"
    >
      <img src="/guest.png" class="w-full h-full object-cover" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  user: User | FullUser | null;
  halo?: boolean;
}>();
</script>
