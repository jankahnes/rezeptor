<template>
  <div class="relative select-none py-1 space-y-2">
    <!-- Fade on right -->
    <div
      v-if="canScrollRight"
      class="absolute right-0 top-0 h-full w-30 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"
    ></div>

    <!-- Scroll buttons -->
    <button
      v-if="canScrollLeft"
      @click="scrollLeft"
      class="absolute left-2 bottom-0 translate-y-10 z-20 bg-none p-1 rounded"
    >
      <span class="material-symbols-outlined !text-base"> arrow_back_ios </span>
    </button>
    <button
      v-if="canScrollRight"
      @click="scrollRight"
      class="absolute right-2 bottom-0 translate-y-10 z-20 bg-none p-1 rounded"
    >
      <span class="material-symbols-outlined !text-base">
        arrow_forward_ios
      </span>
    </button>

    <div
      class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
      ref="scrollContainer1"
      @scroll="checkScroll"
    >
      <div
        class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> psychiatry </span>
        <span class="hidden lg:block">General</span>
      </div>
      <button
        class="px-3 h-7 rounded-xl border-3 border-double flex items-center justify-center gap-2 group whitespace-nowrap opacity-[50%]"
      >
        auto
      </button>
    </div>
    <div
      class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
      ref="scrollContainer2"
      @scroll="checkScroll"
    >
      <div
        class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> grain </span>
        <span class="hidden lg:block">Flavor Profile</span>
      </div>
      <Tag v-for="tag in tags['FLAVOR']" class="" :id="tag.id" :key="tag.id" :style="{ 'opacity': modelValue?.includes(tag.id) ? 1 : 0.5 }" @click="addToList(tag.id)" />
    </div>
    <div
      class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
      ref="scrollContainer3"
      @scroll="checkScroll"
    >
      <div
        class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> room_service </span>
        <span class="hidden lg:block">Course</span>
      </div>
      <Tag v-for="tag in tags['COURSE']" class="" :id="tag.id" :key="tag.id" :style="{ 'opacity': modelValue?.includes(tag.id) ? 1 : 0.5 }" @click="addToList(tag.id)" />
    </div>
    <div
      class="flex gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide"
      ref="scrollContainer4"
      @scroll="checkScroll"
    >
      <div
        class="px-3 rounded-xl border-4 border-double flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <span class="material-symbols-outlined"> public </span>
        <span class="hidden lg:block">Cuisine</span>
      </div>
      <Tag v-for="tag in tags['CUISINE']" class="" :id="tag.id" :key="tag.id" :style="{ 'opacity': modelValue?.includes(tag.id) ? 1 : 0.5 }" @click="addToList(tag.id)" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ modelValue: Array<number> });
const emit = defineEmits(['update:modelValue']);

const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const scrollContainer1 = ref<HTMLDivElement | null>(null);
const scrollContainer2 = ref<HTMLDivElement | null>(null);
const scrollContainer3 = ref<HTMLDivElement | null>(null);
const scrollContainer4 = ref<HTMLDivElement | null>(null);
const scrollContainers = [
  scrollContainer1,
  scrollContainer2,
  scrollContainer3,
  scrollContainer4,
];

onMounted(async () => {
  await nextTick();
  checkScroll();
});

onBeforeUnmount(() => {
  for (const scrollContainer of scrollContainers) {
    scrollContainer.value?.removeEventListener('wheel', onWheel);
  }
});

function scrollLeft() {
  for (const scrollContainer of scrollContainers) {
    scrollContainer.value?.scrollBy({ left: -300 });
  }
}

function scrollRight() {
  for (const scrollContainer of scrollContainers) {
    scrollContainer.value?.scrollBy({ left: 300 });
  }
}

function checkScroll() {
  for (const scrollContainer of scrollContainers) {
    const el = scrollContainer.value;
    if (!el) return;
    canScrollLeft.value = el.scrollLeft > 0;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth;

    el.addEventListener('wheel', onWheel, { passive: false });
  }
}

function onWheel(e: WheelEvent) {
  for (const scrollContainer of scrollContainers) {
    const el = scrollContainer.value;
    if (!el || !e.deltaY) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }
}

function addToList(id:number) {
  if (props.modelValue?.includes(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((value) => value != id)
    );
  } else {
    props.modelValue?.push(id);
    emit('update:modelValue', props.modelValue);
  }
}
</script>

<style scoped></style>
