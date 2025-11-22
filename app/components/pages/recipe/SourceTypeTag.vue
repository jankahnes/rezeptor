<template>
  <a
    class="px-2 rounded-md"
    :class="bgStyles[getWebsiteName(source) as keyof typeof bgStyles]"
    v-if="collection || (sourceType && ['MEDIA', 'WEBSITE'].includes(sourceType))"
    :href="source ?? undefined"
    target="_blank"
  >
    <span
      v-if="collection && collection.startsWith('traditional')"
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
        :class="small ? iconStylesSmall?.[getWebsiteName(source) as keyof typeof iconStylesSmall] : iconStyles?.[getWebsiteName(source) as keyof typeof iconStyles]"
      />
      {{ small ? 'From ' : 'Imported from ' }}
      {{ capitalize(getWebsiteName(source)) }}
    </span>
  </a>
</template>

<script setup lang="ts">
const getWebsiteName = (source: string | null | undefined) => {
  if (!source) return '';
  const url = new URL(source);
  const parts = url.hostname.split('.');
  const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  return domain;
};

const iconStyles = {
  youtube: 'w-5 h-3.5 my-2',
  tiktok: 'w-7 h-7',
  instagram: 'w-6 h-6',
};

const iconStylesSmall = {
  youtube: 'w-4 h-3 my-1',
  tiktok: 'w-5 h-5',
  instagram: 'w-4 h-4 my-0.5',
};

const bgStyles = {
  youtube: "bg-red-200",
  instagram: "bg-orange-100",
  tiktok: "bg-gray-200"
}

const props = defineProps<{
  sourceType?: string | null;
  collection?: string | null;
  source?: string | null;
  small?: boolean;
}>();
</script>

<style scoped></style>
