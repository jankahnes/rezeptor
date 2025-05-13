<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&display=swap"
    rel="stylesheet"
  />
  <div class="min-h-screen bg-gray-50 font-[Inconsolata]">
    <TopBar />
    <div class="flex justify-center"></div>
    <div class="pt-18 xm:pt-22 h-full max-w-[2100px] mx-auto"><NuxtPage /></div>
    <BottomBar class="block xm:hidden" />
  </div>
</template>
