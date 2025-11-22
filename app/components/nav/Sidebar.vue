<template>
  <aside
    class="sidebar min-h-screen h-full bg-primary-10 rounded-r-2xl overflow-hidden transition-all duration-300"
    id="sidebar"
    style="clip-path: url(#sidebar-blob-cutout)"
  >
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <clipPath id="sidebar-blob-cutout" clipPathUnits="objectBoundingBox">
          <path
            d="
        M 0,0
        L 1,0
        L 1,0.065
        C 0.993,0.08 0.97,0.09 0.952,0.105
        S 0.993,0.13 1,0.145
        L 1,1
        L 0,1
        Z
      "
          />
        </clipPath>
      </defs>
    </svg>
    <div class="flex flex-col h-full justify-between">
      <div class="flex flex-col gap-14 flex-1 py-6 pr-4 items-center">
        <Logo />
        <!-- Account View -->
        <div class="flex flex-col gap-4 items-center w-full">
          <Avatar :user="auth.user" class="w-2/3" halo />
          <span
            class="text-xl font-bold text-wrap tracking-tight leading-none transition-all duration-300"
            :class="{ 'text-3xl!': expanded }"
            v-if="auth.isUser()"
            >{{ auth.user!.username }}</span
          >
          <NuxtLink
            to="/login"
            class="animated-button bg-primary/20 text-gray-800 px-4 py-2 font-bold tracking-tight leading-none flex items-center justify-center gap-2"
            v-else
            >Register</NuxtLink
          >
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex flex-col gap-4 p-6">
        <NuxtLink
          to="/"
          class="animated-button text-gray-600 items-center flex gap-2"
          active-class="primary-gradient text-gray-800 px-3 py-1"
        >
          <span class="material-symbols-outlined text-xl!">explore</span>
          <span class="text-base font-bold! tracking-tight leading-none"
            >Discover</span
          >
        </NuxtLink>
        <NuxtLink
          to="/recipes"
          class="animated-button text-gray-600 items-center flex gap-2"
          active-class="primary-gradient text-gray-800 px-3 py-1"
        >
          <span class="material-symbols-outlined text-xl!">restaurant</span>
          <span class="text-base font-bold! tracking-tight leading-none"
            >Your Collection</span
          >
        </NuxtLink>
        <NuxtLink
          to="/tracking"
          class="animated-button text-gray-600 items-center flex gap-2"
          active-class="primary-gradient text-gray-800 px-3 py-1"
        >
          <span class="material-symbols-outlined text-xl!">track_changes</span>
          <span class="text-base font-bold! tracking-tight leading-none"
            >Track Your Diet</span
          >
        </NuxtLink>
        <NuxtLink
          to="/recipe/new?view=form"
          class="animated-button text-gray-600 items-center flex gap-2"
          active-class="primary-gradient text-gray-800 px-3 py-1"
        >
          <span class="material-symbols-outlined text-xl!">add</span>
          <span class="text-base font-bold! tracking-tight leading-none"
            >Create</span
          >
        </NuxtLink>
      </div>

      <!-- Illustration -->
      <div
        class="flex-[0.8] flex-shrink-0 flex items-end justify-center w-full max-w-62 self-center"
      >
        <NuxtImg src="/ill.webp" class="" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const auth = useAuthStore();
defineProps<{
  toggleSidebar: () => void;
  onClickLink: () => void;
  expanded: boolean;
}>();
</script>
