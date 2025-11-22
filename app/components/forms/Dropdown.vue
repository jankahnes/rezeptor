<template>
  <div class="h-full z-99">
    <button
      ref="buttonRef"
      @click.stop="toggle"
      :aria-expanded="isOpen"
      :class="style"
      class="flex items-center justify-between z-10 relative w-full h-full gap-1 p-2 button"
    >
      <span>{{ modelValue }}</span>
      <span
        class="material-symbols-outlined transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      >
        keyboard_arrow_down
      </span>
    </button>

    <Transition @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <div
        v-if="isOpen"
        ref="panelRef"
        :class="style"
        class="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-full border-t-0 z-99 overflow-hidden rounded-xl bg-primary-10 shadow-md"
      >
        <ul class="">
          <li v-for="choice in choices" class="rounded-xl cursor-pointer">
            <button
              class="flex w-full h-full items-center justify-between p-2"
              @click="
                emit('update:modelValue', choice);
                isOpen = false;
              "
            >
              <span class="font-bold">{{ choice }}</span>
              <span
                class="material-symbols-outlined"
                v-if="modelValue === choice"
              >
                check
              </span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const props = defineProps({
  choices: Array<string>,
  modelValue: String,
  style: String,
});
const emit = defineEmits(['update:modelValue']);

const handleClickOutside = (e: MouseEvent) => {
  if (
    !buttonRef.value?.contains(e.target as Node) &&
    !panelRef.value?.contains(e.target as Node)
  ) {
    isOpen.value = false;
  }
};

function beforeEnter(el: Element) {
  (el as HTMLElement).style.height = '0px';
}
function enter(el: Element) {
  const height = el.scrollHeight;
  (el as HTMLElement).style.transition = 'height 150ms ease';
  requestAnimationFrame(() => {
    (el as HTMLElement).style.height = height + 'px';
  });
}
function leave(el: Element) {
  (el as HTMLElement).style.transition = 'height 150ms ease';
  (el as HTMLElement).style.height = '0px';
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped></style>
