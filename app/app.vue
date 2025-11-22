<template>
  <div class="min-h-svh bg-[#f5eeee] font-main" ref="swipeContainer">
    <NuxtPage v-if="route.path === '/onboarding'" />
    <div v-else class="relative" @click="handleClickOutside">
      <Transition name="sidebar">
        <div
          v-if="sidebarOpen"
          ref="sidebarRef"
          class="fixed top-0 left-0 z-99 h-full"
          @click.stop
        >
          <NavSidebar
            :class="sidebarWidth"
            :expanded="sidebarExpanded"
            :toggleSidebar="toggleSidebar"
            :onClickLink="onClickLink"
          />
        </div>
      </Transition>

      <!-- Toggle button in blob notch -->
      <button
        @click.stop="toggleSidebar"
        class="material-symbols-outlined text-2xl! fixed z-[100] text-white hover:text-primary transition-all duration-300 w-8 h-8 flex items-center justify-center cursor-pointer top-[11%] -translate-y-1/2"
        :class="[
          buttonMarginLeft,
          sidebarOpen && !sidebarExpanded
            ? 'rotate-0'
            : 'rotate-180 text-primary! rounded-full',
          !sidebarOpen ? 'hover:bg-primary/10' : '',
        ]"
      >
        <span class="transition-all duration-300 inline-block leading-none">
          chevron_left
        </span>
      </button>
      <div class="flex-1 flex flex-col min-h-svh">
        <div
          class="transition-all duration-300 flex-1 flex flex-col"
          :class="pageMarginLeft"
        >
          <div class="flex-1 text-gray-700">
            <NuxtPage />
          </div>
          <GlobalToastArea />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDrag } from '@vueuse/gesture';
const auth = useAuthStore();
const sidebarOpen = ref(false);
const sidebarExpanded = ref(false);
const sidebarRef = ref<HTMLElement | null>(null);
const swipeContainer = ref<HTMLElement | null>(null);
const width = ref(0);
const isWideScreen = computed(() => width.value >= 1024);
const route = useRoute();

const setExpanded = (path: string) => {
  sidebarExpanded.value = path.startsWith('/profile');
};

watch(
  () => route.path,
  (newPath) => {
    setExpanded(newPath);
  }
);

const sidebarWidth = computed(() => (sidebarExpanded.value ? 'w-100' : 'w-62'));
const pageMarginLeft = computed(() => {
  if (!isWideScreen.value) {
    return 'ml-0';
  }
  if (!sidebarOpen.value) {
    return 'ml-6';
  } else if (sidebarExpanded.value) {
    return 'ml-100';
  } else {
    return 'ml-66';
  }
});

const buttonMarginLeft = computed(() => {
  if (!sidebarOpen.value) return 'left-2';
  else if (sidebarExpanded.value) {
    return 'left-[380px]';
  } else {
    return 'left-[230px]';
  }
});

useHead({
  title: 'Rezeptor',
  meta: [
    {
      name: 'description',
      content: 'Rezeptor is a recipe sharing platform.',
    },
  ],
});

//logic: sidebar default closed, open >lg
const checkScreenSize = () => {
  width.value = document?.documentElement?.clientWidth;
  if (import.meta.client) {
    sidebarOpen.value = width.value >= 1024;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    import.meta.client &&
    document.documentElement.clientWidth < 1024 &&
    sidebarOpen.value
  ) {
    const target = event.target as HTMLElement;
    if (sidebarRef.value && !sidebarRef.value.contains(target)) {
      sidebarOpen.value = false;
    }
  }
};

if (import.meta.client) {
  useDrag(
    ({ swipe: [swipeX], movement: [mx, my], event: PointerEvent }) => {
      const e = 'event' in event ? event.event : event;
      //ignore gestures inside elements with ignore-swipe class
      if ((e.target as HTMLElement).closest('.ignore-swipe')) {
        return;
      }

      if (
        document.documentElement.clientWidth < 1024 &&
        Math.abs(mx) > Math.abs(my) * 1.5
      ) {
        if (swipeX === 1 && !sidebarOpen.value) {
          sidebarOpen.value = true;
        } else if (swipeX === -1 && sidebarOpen.value) {
          sidebarOpen.value = false;
        }
      }
    },
    {
      domTarget: swipeContainer,
      filterTaps: true,
      swipeDistance: 50,
      swipeVelocity: 0.5,
    }
  );
}

onMounted(async () => {
  auth.fetchUser();
  auth.listenToAuthChanges();
  await nextTick();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  setExpanded(route.path);
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkScreenSize);
  }
});

const toggleSidebar = () => {
  if (sidebarExpanded.value) return;
  sidebarOpen.value = !sidebarOpen.value;
};

const onClickLink = () => {
  if (import.meta.client && document.documentElement.clientWidth < 1024) {
    sidebarOpen.value = false;
  }
};
</script>
