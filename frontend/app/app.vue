<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'MegaCorp — Intergalactic Empire',
  description: 'Build your intergalactic empire. Explore, colonize, and research your way to galactic dominion.',
  ogTitle: 'MegaCorp — Intergalactic Empire',
  ogDescription: 'Build your intergalactic empire. Explore, colonize, and research your way to galactic dominion.'
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
