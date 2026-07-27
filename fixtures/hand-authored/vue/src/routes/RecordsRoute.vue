<script setup>
import ColumnPicker from "../components/records/ColumnPicker.vue";
import Pager from "../components/records/Pager.vue";
import RecordTable from "../components/records/RecordTable.vue";
</script>

<template>
  <section class="feature-route" data-testid="view-records">
    <header><p class="muted">Structured source inventory</p><h2>Records</h2></header>
    <div class="feature-grid">
      <RecordTable />
      <div class="stack"><ColumnPicker /><Pager /></div>
    </div>
  </section>
</template>
