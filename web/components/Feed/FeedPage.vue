<script setup lang="ts">
</script>

<template>
  <div class="border-b border-zinc-300 dark:border-zinc-700">
    <div class="py-3 flex flex-col sm:flex-row gap-3">
      <FeedCategorySelector/>
      <div class="flex flex-row items-center">
        <FeedDatePicker/>
      </div>
    </div>
  </div>
  <div class="my-3">
    <FeedList/>
  </div>
</template>

<style scoped>

</style>