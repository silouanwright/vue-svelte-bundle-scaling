<script>
  let jobs = $state([{ id: 1, file: "archive-a.pdf", completed: 82, status: "running" }, { id: 2, file: "notes.docx", completed: 100, status: "complete" }, { id: 3, file: "scan.pdf", completed: 0, status: "failed" }]);
  let active = $derived(jobs.filter((job) => job.status === "running").length);
  function retry(job) { job.status = "running"; job.completed = 1; }
</script>
<aside class="panel stack">
  <h3>Import queue</h3>
  {#each jobs as job (job.id)}<article><strong>{job.file}</strong><progress value={job.completed} max="100"></progress>{#if job.status === "failed"}<button onclick={() => retry(job)}>Retry</button>{/if}</article>{/each}
  <output data-testid="active-imports">{active} active imports</output>
</aside>
