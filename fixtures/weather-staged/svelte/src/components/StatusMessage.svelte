<script>
  let { kind, message } = $props();
</script>

<section class="status-card" data-kind={kind} role="status">
  <strong>{message}</strong>
</section>
