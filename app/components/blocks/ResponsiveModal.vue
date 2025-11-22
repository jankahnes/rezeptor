<template>
  <BlocksModal v-model="isOpen" responsive>
    <slot name="default" />
  </BlocksModal>
  <BlocksBottomSheet v-model="isOpen" class="md:hidden">
    <slot name="default" :is-mobile="true" />
  </BlocksBottomSheet>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
</script>
