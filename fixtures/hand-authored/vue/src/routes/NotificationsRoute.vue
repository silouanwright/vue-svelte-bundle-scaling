<script setup>
import ChannelMatrix from "../components/notifications/ChannelMatrix.vue";
import NotificationList from "../components/notifications/NotificationList.vue";
import QuietHours from "../components/notifications/QuietHours.vue";
</script>
<template>
  <section class="feature-route" data-testid="view-notifications">
    <header><p class="muted">Control attention</p><h2>Notifications</h2></header>
    <div class="feature-grid"><NotificationList /><ChannelMatrix /><QuietHours /></div>
  </section>
</template>
