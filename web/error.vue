<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
	error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/' });

let title = props.error?.statusCode === 404 ? 'Page Not Found' : 'Error';

if (props.error?.message) {
	title += ` - ${props.error.message}`;

	// Slice the message to 75 characters
	if (title.length > 75) {
		title = `${title.slice(0, 75)}...`;
	}
}

useHead({ title });
</script>

<template>
	<UApp>
    <Global>
      <div class="h-full flex flex-col items-center justify-center text-white">
        <div v-if="error" class="flex flex-col md:flex-row items-center gap-5 md:gap-10">
          <div class="md:border-r-2 border-zinc-700 h-full flex flex-col items-center justify-center">
            <h2 class="text-7xl font-bold md:mr-10 justify-self-center text-zinc-700 dark:text-zinc-300">{{ error.statusCode }}</h2>
          </div>
          <div class="flex flex-col gap-2 md:text-lg">
            <div v-if="error.statusCode === 404" class="flex flex-col gap-2 items-center md:items-start text-zinc-700 dark:text-zinc-300">
              <h1 class="text-2xl font-bold">Page Not Found</h1>
              <p class="text-lg">The page you are looking for does not exist.</p>
            </div>
            <code v-else class="bg-black text-sm p-2 rounded-md font-mono max-w-96 max-h-36 overflow-auto">
              {{ error.message }}
            </code>
            <button @click="handleError"
                    class="mt-4 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Global>
  </UApp>
</template>
