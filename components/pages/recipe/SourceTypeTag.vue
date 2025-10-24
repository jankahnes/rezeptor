<template>
  <a
    class="px-2 rounded-md bg-green-500/10 text-sm"
    v-if="['MEDIA', 'WEBSITE'].includes(sourceType) || collection"
    :href="source"
    target="_blank"
  >
    <span
      v-if="collection.startsWith('traditional')"
      class="flex items-center gap-2"
    >
      <span class="material-symbols-outlined !text-lg">award_meal</span>
      From our Traditional
      {{ capitalize(collection.split('-')[1].replace('-', ' ')) }} Collection
    </span>
    <span v-else-if="sourceType === 'WEBSITE'" class="flex items-center gap-2">
      <span class="material-symbols-outlined !text-lg">language</span>
      Imported from {{ capitalize(getWebsiteName(source)) }}
    </span>
    <span v-else-if="sourceType === 'MEDIA'" class="flex items-center gap-2">
      <img
        :src="'/' + getWebsiteName(source) + '.webp'"
        :class="iconStyles?.[getWebsiteName(source) as keyof typeof iconStyles]"
      />
      Imported from {{ capitalize(getWebsiteName(source)) }}
    </span>
  </a>
</template>

<script setup lang="ts">
const getWebsiteName = (source: string) => {
  const url = new URL(source);
  const parts = url.hostname.split('.');
  const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  return domain;
};

const iconStyles = {
    "youtube": "w-5 h-3.5 my-2",
    "tiktok": "w-7 h-7",
    "instagram": "w-6 h-6",
}

const props = defineProps<{
  sourceType: string;
  collection: string;
  source: string;
}>();
</script>

<style scoped></style>
