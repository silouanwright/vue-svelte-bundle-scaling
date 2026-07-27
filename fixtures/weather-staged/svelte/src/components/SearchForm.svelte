<script>
  import { locationLabel } from "@shared/weather-model.js";

  let { query = $bindable(), matches, onselect } = $props();
</script>

<div class="search-panel">
  <div class="search-row">
    <label for="location-search">Location</label>
    <input
      id="location-search"
      bind:value={query}
      type="search"
      autocomplete="off"
      placeholder="Search a city"
    />
  </div>
  {#if matches.length}
    <ul class="suggestions" aria-label="Locations">
      {#each matches as location (location.id)}
        <li>
          <button type="button" onclick={() => onselect(location)}>
            <strong>{locationLabel(location)}</strong>
            <span class="muted"> — {location.country}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
