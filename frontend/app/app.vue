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
  description: 'Build your intergalactic megacorporation. Click, expand, and ascend the Kardashev scale.',
  ogTitle: 'MegaCorp — Intergalactic Empire',
  ogDescription: 'Build your intergalactic megacorporation. Click, expand, and ascend the Kardashev scale.'
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
