<script setup lang="ts">
import clsx from 'clsx';

const colorMode = useColorMode();
const preference = ref<string>(colorMode.preference);
const setPref = (pref: string) => {
	preference.value = pref;
	colorMode.preference = pref;
};
const buttonClass = 'p-1.5';
const selectedClass =
	'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-300 dark:border-zinc-700';
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="items-center rounded-full border border-zinc-300 dark:border-zinc-700">
      <div class="flex flex-row gap-0.5 p-1">
        <UTooltip text="Change to System Theme">
          <UButton
              icon="i-hugeicons-computer"
              size="xs"
              :padded="false"
              color="neutral"
              variant="link"
              title="Auto Mode"
              :class="clsx(buttonClass, preference === 'system' ? selectedClass : '')"
              @click="setPref('system')"
          />
        </UTooltip>
        <UTooltip text="Change to Light Theme">
          <UButton
              icon="i-hugeicons-bulb"
              size="xs"
              :padded="false"
              color="neutral"
              variant="link"
              title="Light Mode"
              :class="clsx(buttonClass, preference === 'light' ? selectedClass : '')"
              @click="setPref('light')"
          />
        </UTooltip>
        <UTooltip text="Change to Dark Theme">
          <UButton
              icon="i-hugeicons-moon-02"
              size="xs"
              :padded="false"
              color="neutral"
              variant="link"
              title="Dark Mode"
              :class="clsx(buttonClass, preference === 'dark' ? selectedClass : '')"
              @click="setPref('dark')"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>