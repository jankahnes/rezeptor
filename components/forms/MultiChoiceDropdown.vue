<template>
  <div class="relative">
    <button
      ref="buttonRef"
      @click.stop="toggle"
      :aria-expanded="isOpen.toString()"
      class="flex items-center justify-between z-10 relative w-full"
      :class="style"
    >
      <span class="pl-1">{{ formatList(modelValue) || placeholder }}</span>
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
        @click.stop
        ref="panelRef"
        class="absolute top-full left-0 w-full border-t-0 z-20 overflow-hidden"
        :class="style"
      >
        <ul class="">
          <li
            v-for="choice in choices"
            class="hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            <button
              v-if="modelValue?.includes(choice)"
              class="flex w-full h-full items-center justify-between p-2"
              @click="emit('update:modelValue', addToList(modelValue, choice))"
            >
              <span class="font-bold">{{ choice }}</span>
              <span
                class="material-symbols-outlined"
              >
                check
              </span>
            </button>
            <button
              v-else
              class="flex items-center w-full h-full p-2"
              @click="emit('update:modelValue', addToList(modelValue, choice))"
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
  modelValue: Array<String>,
  style: String,
  placeholder: String,
});
const emit = defineEmits(['update:modelValue']);

function formatList(list: Array<String>) {
  return list.join(', ');
}

function addToList(list: Array<String>, string: String) {
  if (list.includes(string)) {
    list = list.filter((item) => item !== string);
    return list;
  } else {
    list.push(string);
    return list;
  }
}

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
