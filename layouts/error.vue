<template>
  <v-app>
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <NuxtLink to="/">
      Home page
    </NuxtLink>
  </v-app>
</template>

<script setup lang="ts">
interface ErrorProps {
  error: {
    statusCode: number
  }
}

const props = defineProps<ErrorProps>()

const pageNotFound = ref('404 Not Found')
const otherError = ref('An error occurred')

useHead(() => ({
  title: props.error.statusCode === 404 ? pageNotFound.value : otherError.value
}))
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
