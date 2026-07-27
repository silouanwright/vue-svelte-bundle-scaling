<script>
  import { notifications as initial } from "@shared/catalog.js";
  let notices = $state(initial.map((item) => ({ ...item })));
  let unreadOnly = $state(false);
  let visible = $derived(unreadOnly ? notices.filter((item) => !item.read) : notices);
  function dismiss(id) { notices = notices.filter((item) => item.id !== id); }
</script>
<article class="panel stack">
  <div class="inline"><h3>Inbox</h3><label class="inline"><input bind:checked={unreadOnly} type="checkbox" /> Unread only</label></div>
  {#each visible as notice (notice.id)}<article><strong>{notice.title}</strong><small>{notice.channel}</small><button onclick={() => dismiss(notice.id)}>Dismiss</button></article>{/each}
  {#if !visible.length}<p>Nothing to review</p>{/if}
  <output data-testid="notice-count">{visible.length} notifications</output>
</article>
