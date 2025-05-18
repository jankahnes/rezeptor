<template>
  <div class="">
    <div
      class="animate-pulse bg-white dark:bg-gray-300 w-full h-full"
      :style="{
        animationDelay: `${(Math.random() * 1.5).toFixed(2)}s`,
        animationDuration: `${1 + Math.random()}s`,
      }"
    ></div>
  </div>
</template>

<script setup></script>
