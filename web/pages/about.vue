<script setup lang="ts">
useHead({
	title: 'About',
	meta: [
		{
			name: 'description',
			content: 'The brief and introduction of News Fusion',
		},
	],
});
</script>

<template>
  <article class="flex flex-col gap-3 text-zinc-700 dark:text-zinc-400 pt-4 mb-10">
    <p>
      I'm ckt, a technology enthusiast based in Hong Kong.
    </p>
    <p>
      My interests span multiple fields, including technology, politics,
      science, and various interesting topics found online.
    </p>
    <h2 class="font-semibold mt-4 text-black dark:text-white">
      What is this site?
    </h2>
    <p>
      This site is a curated collection of useful and interesting news,
      articles, and information from diverse sources.
    </p>
    <p>
      All content is scored and filtered using AI prompts to focus on the most
      important and relevant information.
    </p>
    <p>
      With AI-generated summaries, you can absorb more information in less
      time.
    </p>
    <h2 class="font-semibold mt-4 text-black dark:text-white">
      Why did I build this site?
    </h2>
    <p>
      I created this site not just for fun and learning, but to reduce the
      time and attention I spend tracking various social media platforms.
    </p>
    <p>
      It's undeniable that platforms like Twitter and Reddit are incredibly
      content-rich, filled with countless useful posts and news items.
    </p>
    <p>
      However, due to platform algorithms, these sites continuously push
      content you like, causing you to devote a large portion of your time to
      them. For those with limited self-discipline, escaping the immersive
      flow of endless scrolling can be nearly impossible.
    </p>
    <p>
      Therefore, this site aims to consolidate everything into one place,
      using AI to filter for importance. The goal is to reclaim time for the
      life we want to live.
    </p>
    <h2 class="font-semibold mt-4 text-black dark:text-white">
      What about the operational costs?
    </h2>
    <p>
      The concept of "expensive" can vary. $1 can be affordable for
      those with jobs, but costly for students.
    </p>
    <p>
      This site uses multiple AI models to filter, embed, and re-rank the
      desired news. These include Google's <b>Gemini 2.0 Flash</b> for scoring,
      filtering, and summarization, also with OpenAI's <b>Text Embeddings v3 Small</b> for vector
      operations.
    </p>
    <p>
      On average, the daily operational cost ranges from <b>$1 to $3</b> in US dollars.
    </p>
    <h2 class="font-semibold mt-4 text-black dark:text-white">
      Is this website free to access?
    </h2>
    <p>Currently yes, I will remain free to access in order to listen to your feedback.</p>
  </article>
</template>

<style scoped>

</style>
