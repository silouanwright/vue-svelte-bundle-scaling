<script>
  import MetricBoard from "../components/dashboard/MetricBoard.svelte";
  import ActivityTimeline from "../components/dashboard/ActivityTimeline.svelte";
  import HealthChecklist from "../components/dashboard/HealthChecklist.svelte";
</script>

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
