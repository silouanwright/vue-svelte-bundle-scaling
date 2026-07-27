<script setup lang="ts">
import { RouterView } from "vue-router";
import AppToaster from "$lib/ui/AppToaster.vue";
import AppDialogs from "$lib/components/AppDialogs.vue";
</script>

<template>
  <RouterView />
  <AppDialogs />
  <AppToaster />
</template>
