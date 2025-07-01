<template>
  <div class="h-full">
    <button
      ref="buttonRef"
      @click.stop="toggle"
      :aria-expanded="isOpen.toString()"
      :class="style"
      class="flex items-center justify-between z-10 relative w-full h-full gap-1 p-2 border-primary border-2 rounded-xl bg-main"
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
        class="absolute top-full left-1/2 -translate-x-1/2 w-full border-t-0 z-20 overflow-hidden border-primary border-2 rounded-xl bg-main"
      >
        <ul class="">
          <li v-for="choice in choices" class="rounded-xl cursor-pointer">
            <button
              v-if="modelValue == choice"
              class="flex w-full h-full items-center justify-between p-2"
              @click="emit('update:modelValue', choice)"
            >
              <span class="font-bold">{{ choice }}</span>
              <span class="material-symbols-outlined"> check </span>
            </button>
            <button
              v-else
              class="flex items-center w-full h-full p-2"
              @click="emit('update:modelValue', choice)"
            >
              <span>{{ choice }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const buttonRef = ref(null);
const panelRef = ref(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const props = defineProps({
  choices: Array,
  modelValue: String,
  style: String,
});
const emit = defineEmits(['update:modelValue']);

const handleClickOutside = (e) => {
  if (
    !buttonRef.value.contains(e.target) &&
    !panelRef.value?.contains(e.target)
  ) {
    isOpen.value = false;
  }
};

function beforeEnter(el) {
  el.style.height = '0px';
}
function enter(el) {
  const height = el.scrollHeight;
  el.style.transition = 'height 150ms ease';
  requestAnimationFrame(() => {
    el.style.height = height + 'px';
  });
}
function leave(el) {
  el.style.transition = 'height 150ms ease';
  el.style.height = '0px';
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped></style>
