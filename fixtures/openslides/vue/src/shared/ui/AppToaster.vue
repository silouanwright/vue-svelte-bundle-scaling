<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>

<template>
  <Toaster
    theme="system"
    position="bottom-right"
    close-button
    :gap="12"
    :offset="18"
    :visible-toasts="5"
  />
</template>
