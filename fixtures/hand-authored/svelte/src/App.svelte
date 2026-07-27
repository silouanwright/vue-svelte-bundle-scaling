<script>
  import DashboardRoute from "./routes/DashboardRoute.svelte";

  const routes = [
    { id: "dashboard", label: "Dashboard", load: async () => DashboardRoute },
    { id: "search", label: "Search", load: () => import("./routes/SearchRoute.svelte").then((module) => module.default) },
    { id: "records", label: "Records", load: () => import("./routes/RecordsRoute.svelte").then((module) => module.default) },
    { id: "reader", label: "Reader", load: () => import("./routes/ReaderRoute.svelte").then((module) => module.default) },
    { id: "editor", label: "Editor", load: () => import("./routes/EditorRoute.svelte").then((module) => module.default) },
    { id: "settings", label: "Settings", load: () => import("./routes/SettingsRoute.svelte").then((module) => module.default) },
    { id: "notifications", label: "Notifications", load: () => import("./routes/NotificationsRoute.svelte").then((module) => module.default) },
    { id: "library", label: "Library", load: () => import("./routes/LibraryRoute.svelte").then((module) => module.default) },
  ];

  let currentId = $state("dashboard");
  let CurrentRoute = $state(DashboardRoute);

  async function openRoute(route) {
    currentId = route.id;
    CurrentRoute = await route.load();
  }
</script>

<div class="app-shell">
  <nav class="app-nav" aria-label="Application routes">
    <h1>Research Workspace</h1>
    {#each routes as route (route.id)}
      <button
        aria-current={currentId === route.id ? "page" : undefined}
        data-testid={`route-${route.id}`}
        onclick={() => openRoute(route)}
      >
        {route.label}
      </button>
    {/each}
  </nav>
  <main class="workspace">
    <CurrentRoute />
  </main>
</div>
