<script setup lang="ts">

</script>

<template>
  <footer class="flex flex-col justify-center items-center gap-3 mt-8 mb-5">
    <div
        class="flex justify-center items-center flex-row text-zinc-500 dark:text-zinc-400 gap-3"
    >
        <a href="/about">
          About
        </a>
        <a href="/rss">
          RSS
        </a>
        <a href="https://github.com/ckt1031" target="_blank">
          Author
        </a>
    </div>
    <ClientOnly>
      <ThemeSwitcher/>
    </ClientOnly>
  </footer>
</template>

<style scoped>

</style>