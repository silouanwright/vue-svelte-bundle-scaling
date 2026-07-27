<script>
  import { activities } from "@shared/catalog.js";

  let selectedKind = $state("all");
  const kinds = ["all", ...new Set(activities.map((activity) => activity.kind))];
  let visible = $derived(
    selectedKind === "all"
      ? activities
      : activities.filter((activity) => activity.kind === selectedKind),
  );
</script>

<article class="panel stack">
  <h3>Recent activity</h3>
  <div class="inline" aria-label="Activity filters">
    {#each kinds as kind (kind)}
      <button aria-pressed={selectedKind === kind} onclick={() => (selectedKind = kind)}>
        {kind}
      </button>
    {/each}
  </div>
  <ol data-testid="activity-list">
    {#each visible as activity (activity.id)}
      <li>
        <strong>{activity.label}</strong>
        <span class="muted">{activity.minutes} minutes ago</span>
      </li>
    {/each}
  </ol>
</article>
