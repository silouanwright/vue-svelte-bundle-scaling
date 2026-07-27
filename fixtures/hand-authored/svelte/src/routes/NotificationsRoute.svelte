<script>
  import ChannelMatrix from "../components/notifications/ChannelMatrix.svelte";
  import NotificationList from "../components/notifications/NotificationList.svelte";
  import QuietHours from "../components/notifications/QuietHours.svelte";
</script>
<section class="feature-route" data-testid="view-notifications">
  <header><p class="muted">Control attention</p><h2>Notifications</h2></header>
  <div class="feature-grid"><NotificationList /><ChannelMatrix /><QuietHours /></div>
</section>
