<script setup>
import MetricBoard from "../components/dashboard/MetricBoard.vue";
import ActivityTimeline from "../components/dashboard/ActivityTimeline.vue";
import HealthChecklist from "../components/dashboard/HealthChecklist.vue";
</script>

<template>
  <section class="feature-route" data-testid="view-dashboard">
    <header>
      <p class="muted">Workspace overview</p>
      <h2>Dashboard</h2>
    </header>
    <div class="feature-grid">
      <MetricBoard />
      <ActivityTimeline />
      <HealthChecklist />
    </div>
  </section>
</template>
