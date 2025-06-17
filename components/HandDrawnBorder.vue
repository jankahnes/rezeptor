<template>
  <div class="relative inline-block">
    <div class="relative z-10">
      <slot />
    </div>
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
    >
      <rect
        x="8"
        y="8"
        width="384"
        height="144"
        :fill="bgColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="`filter: url(#roughness-${seed})`"
      />
      <filter
        :id="`roughness-${seed}`"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="roughness/200"
          numOctaves="20"
          :seed="seed"
          result="turb"
        /> 
        <feDisplacementMap
          in="SourceGraphic"
          in2="turb"
          :scale="roughness*30"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feGaussianBlur in="displaced" :stdDeviation="blur" />
      </filter> 
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ strokeColor: String, strokeWidth: Number, bgColor: String, roughness: Number, blur: Number });
const bgColor = props.bgColor || 'none';
const seed = Math.floor(Math.random() * 100);
</script>
