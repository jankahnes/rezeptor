<template>
  <aside
    class="sidebar h-full bg-primary-10 rounded-r-2xl overflow-hidden transition-all duration-300 notch"
    id="sidebar"
  >
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <clipPath id="sidebar-blob-cutout" clipPathUnits="objectBoundingBox">
          <path
            d="M 0,0 L 1,0 L 1,0.065 C 0.993,0.08 0.97,0.09 0.952,0.105 S 0.993,0.13 1,0.145 L 1,1 L 0,1 Z"
          />
        </clipPath>
      </defs>
    </svg>
    <div class="flex flex-col h-full justify-between">
      <div class="flex flex-col gap-10 py-6 pr-4 items-center flex-1">
        <Logo />
        <!-- Account View -->
        <div
          class="flex flex-col gap-4 items-center w-full transition-all duration-300"
        >
          <Avatar
            :user="auth.user"
            class="rounded-full w-1/2"
            :placeholder="!auth.profileFetched"
            :halo="focusedIndex !== 0"
            :ring="focusedIndex === 0 && sidebarNavigationActive"
            @click="onClickLink(accountLink)"
          />
          <Transition name="fade" mode="out-in">
            <Skeleton
              v-if="!auth.profileFetched"
              class="rounded-4xl w-2/3 h-8"
            />
            <span
              class="text-xl font-bold text-wrap tracking-normal leading-none transition-all duration-300"
              :class="{ 'text-3xl!': expanded }"
              v-else-if="auth.isUser()"
              >{{ auth.user!.username }}</span
            >
            <div class="flex gap-2" v-else>
              <NuxtLink
                to="/login"
                @click="onClickLink('/login')"
                class="animated-button bg-primary-50 text-gray-800 px-4 py-2 font-bold tracking-tight leading-none flex items-center justify-center gap-2"
                >Login</NuxtLink
              >
              <NuxtLink
                to="/onboarding"
                @click="onClickLink('/onboarding')"
                class="animated-button bg-primary-200 text-gray-800 px-4 py-2 font-bold tracking-tight leading-none flex items-center justify-center gap-2"
                >Register</NuxtLink
              >
            </div>
          </Transition>
        </div>
      </div>

      <!-- Navigation Links -->
      <div
        class="flex flex-col gap-4 p-6 transition-all duration-300"
        :class="{ 'mt-4': expanded }"
      >
        <NuxtLink
          to="/"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 1 && sidebarNavigationActive,
          }"
          active-class="primary-gradient text-gray-800 px-3 py-2"
          @click="onClickLink('/')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >home</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Home</span
          >
        </NuxtLink>
        <NuxtLink
          to="/discover"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 2 && sidebarNavigationActive,
          }"
          active-class="primary-gradient text-gray-800 px-3 py-2"
          @click="onClickLink('/discover')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >explore</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Discover</span
          >
        </NuxtLink>
        <NuxtLink
          to="/recipe/new?view=form"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 3 && sidebarNavigationActive,
          }"
          active-class="primary-gradient text-gray-800 px-3 py-2"
          @click="onClickLink('/recipe/new')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >add</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Create</span
          >
        </NuxtLink>
        <NuxtLink
          to="/recipes"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 4 && sidebarNavigationActive,
            'primary-gradient text-gray-800 px-3 py-2':
              route.path.startsWith('/recipes'),
          }"
          @click="onClickLink('/recipes')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >book_2</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Collection</span
          >
        </NuxtLink>
        <NuxtLink
          to="/tracking"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 5 && sidebarNavigationActive,
          }"
          active-class="primary-gradient text-gray-800 px-3 py-2"
          @click="onClickLink('/tracking')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >insert_chart</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Track Your Diet</span
          >
        </NuxtLink>

        <NuxtLink
          to="/community"
          class="animated-button text-gray-600 items-center flex gap-2 py-1 rounded transition-all"
          :class="{
            'ring-2 ring-primary-500 ring-offset-2':
              focusedIndex === 6 && sidebarNavigationActive,
          }"
          active-class="primary-gradient text-gray-800 px-3 py-2"
          @click="onClickLink('/community')"
        >
          <span
            class="material-symbols-outlined text-xl transition-all duration-300"
            >people</span
          >
          <span
            class="text-lg font-bold! tracking-tight leading-none transition-all duration-300"
            >Community</span
          >
        </NuxtLink>
      </div>

      <!-- Illustration -->
      <div
        class="flex-shrink-0 flex items-end justify-center w-full max-w-62 self-center flex-1"
      >
        <NuxtImg src="/ill.webp" class="w-full" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
defineProps<{
  toggleSidebar: () => void;
  onClickLink: (link: string) => void;
  expanded: boolean;
  sidebarNavigationActive: boolean;
}>();

const accountLink = computed(() => {
  if (!auth.user?.username) return '/onboarding';
  else {
    return '/profile/' + auth.user?.id;
  }
});

const linkPaths = computed(() => [
  auth.isUser() ? accountLink.value : '/onboarding',
  '/',
  '/discover',
  '/recipe/new',
  '/recipes',
  '/tracking',
  '/community',
]);
const focusedIndex = ref(-1);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    focusedIndex.value = Math.min(
      focusedIndex.value + 1,
      linkPaths.value.length - 1
    );
    e.preventDefault();
    const linkPath = linkPaths.value[focusedIndex.value];
    navigateTo(linkPath);
  } else if (e.key === 'ArrowUp') {
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
    e.preventDefault();
    const linkPath = linkPaths.value[focusedIndex.value];
    navigateTo(linkPath);
  }
};

const focusActiveLink = () => {
  const index = linkPaths.value.indexOf(route.path);
  if (index == -1) {
    const startsWithIndex = linkPaths.value.findIndex(
      (path) => path !== '/' && route.path.startsWith(path)
    );
    if (startsWithIndex !== -1) {
      focusedIndex.value = startsWithIndex;
    } else {
      focusedIndex.value = 1;
    }
  } else {
    focusedIndex.value = index;
  }
};

watch(() => route.path, focusActiveLink, { immediate: true });

defineExpose({
  handleKeydown,
});
</script>

<style scoped>
@media (min-width: 1024px) {
  .notch {
    clip-path: url(#sidebar-blob-cutout);
  }
}
</style>
