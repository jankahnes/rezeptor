<template>
  <div class="h-full bg-[#fffefcb]">
    <button
      ref="buttonRef"
      @click.stop="toggle"
      :aria-expanded="isOpen.toString()"
      class="flex items-center border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] justify-between z-10 relative w-full h-full"
      :class="{ 'shadow-none !border-1 !px-2 !py-0': thin }"
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
        class="absolute top-full left-0 w-full border-2 border-t-0 bg-[#fffefcb]0 shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-20 overflow-hidden"
        :class="{ 'shadow-none !border-1': thin }"
      >
        <ul class="">
          <li
            v-for="choice in choices"
            class="hover:bg-gray-200 cursor-pointer"
          >
            <button
              v-if="modelValue == choice"
              class="flex w-full h-full items-center justify-between p-2"
              :class="{ '!px-2 !py-1': thin }"
              @click="emit('update:modelValue', choice)"
            >
              <span class="font-bold">{{ choice }}</span>
              <span
                class="material-symbols-outlined"
                :class="{ '!text-base': thin }"
              >
                check
              </span>
            </button>
            <button
              v-else
              class="flex items-center w-full h-full p-2"
              :class="{ '!px-2 !py-1': thin }"
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
  choices: Array<String>,
  modelValue: String,
  thin: Boolean,
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
  el.style.transition = 'height 300ms ease';
  requestAnimationFrame(() => {
    el.style.height = height + 'px';
  });
}
function leave(el) {
  el.style.transition = 'height 300ms ease';
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
