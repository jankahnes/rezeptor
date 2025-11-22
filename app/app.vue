<template>
  <div class="min-h-svh bg-[#f5eeee] font-main" ref="swipeContainer">
    <div class="relative" @click="handleClickOutside">
      <Transition name="sidebar">
        <div
          v-if="sidebarOpen"
          ref="sidebarRef"
          class="fixed top-0 left-0 z-99 h-full"
          @click.stop
        >
          <NavSidebar
            ref="sidebarComponentRef"
            :class="sidebarWidth"
            :expanded="sidebarExpanded"
            :toggleSidebar="toggleSidebar"
            :onClickLink="onClickLink"
            :sidebarNavigationActive="sidebarExpanded"
          />
        </div>
      </Transition>

      <Transition name="fade-up">
        <NavBottom v-if="width && width < 700" />
      </Transition>

      <!-- Toggle button in blob notch -->
      <button
        @click.stop="toggleSidebar"
        class="hidden lg:flex text-2xl! fixed z-[100] text-white hover:text-primary transition-all duration-300 w-8 h-8 items-center justify-center cursor-pointer top-[11%] -translate-y-1/2"
        :class="[
          buttonMarginLeft,
          sidebarOpen && !sidebarExpanded
            ? 'rotate-0'
            : 'rotate-180 text-primary! rounded-full',
          !sidebarOpen ? 'hover:bg-primary/10' : '',
        ]"
      >
        <span
          class="transition-all duration-300 inline-block leading-none material-symbols-outlined"
        >
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
            <GlobalLoadingIndicator :left="pageMarginLeft" />
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

//init sidebar state using header heuristic
const headers = useRequestHeaders();
const userAgent = headers['user-agent'] || navigator.userAgent;
const isMobile = /iphone|android.+mobile|ipad|ipod/i.test(userAgent || '');

const sidebarOpen = ref(!isMobile);

if (!import.meta.client) {
  console.log(
    'INFO: Rendered ' +
      (sidebarOpen.value ? 'WITH' : 'WITHOUT') +
      ' sidebar on SSR'
  );
}

const sidebarExpanded = ref(false);
const sidebarRef = ref<HTMLElement | null>(null);
const sidebarComponentRef = ref<{
  handleKeydown: (e: KeyboardEvent) => void;
} | null>(null);
const swipeContainer = ref<HTMLElement | null>(null);
const width = ref(0);
const isWideScreen = computed(() => width.value >= 1024);
const route = useRoute();

const setExpanded = (path: string, keep: boolean = false) => {
  if (path.startsWith('/profile')) {
    sidebarExpanded.value = true;
  } else if (!keep) {
    sidebarExpanded.value = false;
  }
};

watch(
  () => route.path,
  (newPath) => {
    if (isWideScreen.value) {
      setExpanded(newPath, true);
    }
  }
);

const sidebarWidth = computed(() => (sidebarExpanded.value ? 'w-100' : 'w-62'));
const pageMarginLeft = computed(() => {
  // if width is measured and not wide screen or not measured and mobile, return ml-0
  if ((width.value && !isWideScreen.value) || (!width.value && isMobile)) {
    return 'ml-0';
  }
  if (!sidebarOpen.value) {
    return 'ml-0';
  } else if (sidebarExpanded.value) {
    return 'ml-92';
  } else {
    return 'ml-58';
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
  sidebarOpen.value = width.value >= 1024;
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
  } else {
    setExpanded(route.path, false);
  }
};

if (import.meta.client) {
  useDrag(
    ({ swipe: [swipeX], movement: [mx, my], event, cancel }) => {
      if ((event?.target as HTMLElement)?.closest('.ignore-swipe')) {
        cancel();
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

const handleKeyboardNavigation = (e: KeyboardEvent) => {
  // Only handle if not typing in an input/textarea/contenteditable
  const target = e.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  // Handle sidebar navigation when open
  if (
    sidebarOpen.value &&
    sidebarExpanded.value &&
    (e.key === 'ArrowUp' || e.key === 'ArrowDown')
  ) {
    sidebarComponentRef.value?.handleKeydown(e);
    return;
  }

  if (e.key === 'ArrowLeft') {
    if (!sidebarOpen.value) {
      e.preventDefault();
      sidebarOpen.value = true;
    } else if (!sidebarExpanded.value) {
      sidebarExpanded.value = true;
    }
  } else if (e.key === 'ArrowRight' && sidebarOpen.value) {
    e.preventDefault();
    if (sidebarExpanded.value) {
      setExpanded(route.path, false);
    } else {
      sidebarOpen.value = false;
      sidebarExpanded.value = false;
    }
  }
};

onMounted(async () => {
  checkScreenSize();
  auth.listenToAuthChanges();
  auth.fetchUser();
  window.addEventListener('resize', checkScreenSize);
  window.addEventListener('keydown', handleKeyboardNavigation);
  setExpanded(route.path, false);
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkScreenSize);
    window.removeEventListener('keydown', handleKeyboardNavigation);
  }
});

const toggleSidebar = () => {
  if (sidebarExpanded.value) {
    navigateTo('/');
    sidebarExpanded.value = false;
    return;
  }
  sidebarOpen.value = !sidebarOpen.value;
};

const onClickLink = async (link: string) => {
  if (import.meta.client && document.documentElement.clientWidth < 1024) {
    sidebarOpen.value = false;
  }
  await nextTick();
  setExpanded(link, false);
};
</script>

<style>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-up-enter-to,
.fade-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
