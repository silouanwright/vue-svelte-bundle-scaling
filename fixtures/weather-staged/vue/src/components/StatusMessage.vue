<script setup>
defineProps({
  kind: { type: String, required: true },
  message: { type: String, required: true },
});
</script>

<template>
  <section class="status-card" :data-kind="kind" role="status">
    <strong>{{ message }}</strong>
  </section>
</template>
