<template>
  <div class="relative select-none">
    <div
      v-if="canScrollLeft"
      class="absolute left-0 top-0 h-full w-30 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"
    ></div>

    <!-- Fade on right -->
    <div
      v-if="canScrollRight"
      class="absolute right-0 top-0 h-full w-30 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"
    ></div>

    <!-- Scroll buttons -->
    <button
      v-if="canScrollLeft"
      @click="scrollLeft"
      class="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-none p-1 rounded"
    >
      <span class="material-symbols-outlined !text-base"> arrow_back_ios </span>
    </button>
    <button
      v-if="canScrollRight"
      @click="scrollRight"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-none p-1 rounded"
    >
      <span class="material-symbols-outlined !text-base">
        arrow_forward_ios
      </span>
    </button>

    <div
      class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
      ref="scrollContainer"
      @scroll="checkScroll"
    >
      <div
        class="px-3 py-1 rounded-2xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> psychiatry </span>
        <span>General</span>
      </div>
      <div
        v-for="tag in TAGS['GENERAL']"
        class="tag px-3 py-1 metallic-gradient-simple whitespace-nowrap"
        @click="clickFunction(tag)"
      >
        {{ getTagByID(tag.id).name }}
      </div>
      <div
        class="px-3 py-1 rounded-2xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> grain </span>
        <span>Flavor Profile</span>
      </div>
      <div
        v-for="tag in TAGS['FLAVOR']"
        class="tag px-3 py-1 metallic-gradient-simple whitespace-nowrap"
        @click="clickFunction(tag)"
      >
        {{ getTagByID(tag.id).name }}
      </div>
      <div
        class="px-3 py-1 rounded-2xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> room_service </span>
        <span>Course</span>
      </div>
      <div
        v-for="tag in TAGS['COURSE']"
        class="tag px-3 py-1 metallic-gradient-simple whitespace-nowrap"
        @click="clickFunction(tag)"
      >
        {{ getTagByID(tag.id).name }}
      </div>
      <div
        class="px-3 py-1 rounded-2xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> public </span>
        <span>Cuisine</span>
      </div>
      <div
        v-for="tag in TAGS['CUISINE']"
        class="tag px-3 py-1 metallic-gradient-simple whitespace-nowrap"
        @click="clickFunction(tag)"
      >
        {{ getTagByID(tag.id).name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ clickFunction: Function });

const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const scrollContainer = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  await nextTick();
  checkScroll();
});

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('wheel', onWheel);
});

function scrollLeft() {
  scrollContainer.value?.scrollBy({ left: -300 });
}

function scrollRight() {
  scrollContainer.value?.scrollBy({ left: 300 });
}

function checkScroll() {
  const el = scrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth;

  el.addEventListener('wheel', onWheel, { passive: false });
}

function onWheel(e: WheelEvent) {
  const el = scrollContainer.value;
  if (!el || !e.deltaY) return;
  e.preventDefault();
  el.scrollLeft += e.deltaY;
}
</script>

<style scoped></style>
