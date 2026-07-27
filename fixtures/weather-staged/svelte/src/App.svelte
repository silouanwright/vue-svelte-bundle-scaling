<script>
  import { locations, weatherByLocation } from "@shared/weather-data.js";
  import {
    findLocations,
    locationLabel,
    weatherSummary,
  } from "@shared/weather-model.js";
  import CurrentWeather from "./components/CurrentWeather.svelte";
  import ForecastList from "./components/ForecastList.svelte";
  import SearchForm from "./components/SearchForm.svelte";
  import StatusMessage from "./components/StatusMessage.svelte";

  let selectedId = $state("chicago");
  let query = $state("");
  let unit = $state("celsius");
  let loading = $state(false);
  let error = $state("");

  let selectedWeather = $derived(weatherByLocation[selectedId]);
  let matches = $derived(findLocations(locations, query));
  let summary = $derived(weatherSummary(selectedWeather, unit));

  async function selectLocation(location) {
    loading = true;
    error = "";
    query = locationLabel(location);
    await Promise.resolve();
    selectedId = location.id;
    loading = false;
  }
</script>

<div class="app-shell">
  <header class="app-header">
    <div>
      <p class="muted">Normalized Vue 3 / Svelte 5 fixture</p>
      <h1>Weather Workspace</h1>
    </div>
    <div class="header-actions">
      <SearchForm bind:query {matches} onselect={selectLocation} />
      <div class="unit-switch" aria-label="Temperature unit">
        <button
          type="button"
          aria-pressed={unit === "celsius"}
          onclick={() => (unit = "celsius")}>°C</button
        >
        <button
          type="button"
          aria-pressed={unit === "fahrenheit"}
          onclick={() => (unit = "fahrenheit")}>°F</button
        >
      </div>
    </div>
  </header>

  {#if loading}
    <StatusMessage kind="loading" message="Loading weather…" />
  {:else if error}
    <StatusMessage kind="error" message={error} />
  {:else}
    <main class="content-grid" aria-label={summary}>
      <CurrentWeather weather={selectedWeather} {unit} />
      <ForecastList forecast={selectedWeather.forecast} {unit} />
    </main>
  {/if}
</div>
