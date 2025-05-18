<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&display=swap"
    rel="stylesheet"
  />
  <div class="bg-gray-50 font-[Inconsolata]">
    <NavbarsTop />
    <div class="flex justify-center"></div>
    <div
      class="mt-18 xm:mt-22 mb-18 xm:mb-0 max-w-[1588px] 3xl:max-w-[1899px] mx-auto min-h-[calc(100svh_-_144px)] xm:min-h-[calc(100svh_-_88px)]"
    >
      <NuxtPage />
    </div>
    <NavbarsBottom class="block xm:hidden" />
  </div>
</template>