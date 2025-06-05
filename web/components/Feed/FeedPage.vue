<script setup lang="ts">
</script>

<template>
  <div class="border-b border-zinc-400 dark:border-zinc-600">
    <div class="py-3 flex flex-col sm:flex-row gap-3">
      <FeedCategorySelector/>
      <div class="flex flex-row items-center">
        <FeedDatePicker/>
      </div>
    </div>
  </div>
  <FeedList/>
</template>

<style scoped>

</style>