<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-main text-slate-700 z-99 w-full flex justify-between items-center pb-2 pt-3 px-2 xs:px-6 rounded-t-4xl border-t-2 border-slate-200"
  >
    <NuxtLink
      v-for="link in sideLinks.slice(0, 2)"
      :key="link.path"
      :to="link.path"
      class="material-symbols-outlined text-3xl! font-light! flex-1 text-center"
      active-class="icon-fill font-bold!"
    >
      {{ link.icon }}
    </NuxtLink>
    <div class="flex-1 flex justify-center">
      <NuxtLink
        :to="primaryLink.path"
        class="rounded-full bg-primary h-15 w-15 flex items-center justify-center -mt-7 button-shadow shadow-primary-600"
        active-class="font-bold!"
      >
        <span
          class="material-symbols-outlined text-3xl!"
          :class="
            route.path.startsWith(primaryLink.path) ? 'font-semibold!' : ''
          "
          >{{ primaryLink.icon }}</span
        >
      </NuxtLink>
    </div>
    <NuxtLink
      v-for="link in sideLinks.slice(2)"
      :key="link.path"
      :to="link.path"
      class="material-symbols-outlined text-3xl! font-light! flex-1 text-center"
      active-class="icon-fill font-bold!"
    >
      {{ link.icon }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const sideLinks = [
  {
    name: 'Home',
    icon: 'home',
    path: '/',
  },
  {
    name: 'Discover',
    icon: 'explore',
    path: '/discover',
  },

  {
    name: 'Tracking',
    icon: 'insert_chart',
    path: '/tracking',
  },
  {
    name: 'Community',
    icon: 'people',
    path: '/community',
  },
];

const primaryLink = {
  name: 'Create',
  icon: 'add',
  path: '/recipe/new',
};

const route = useRoute();
</script>

<style scoped>
.button-shadow {
  box-shadow: 0 0 14px var(--tw-shadow-color);
}
</style>
