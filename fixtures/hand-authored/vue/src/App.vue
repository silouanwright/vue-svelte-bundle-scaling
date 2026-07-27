<script setup>
import { markRaw, shallowRef } from "vue";

import DashboardRoute from "./routes/DashboardRoute.vue";

const routes = [
  { id: "dashboard", label: "Dashboard", load: async () => DashboardRoute },
  { id: "search", label: "Search", load: () => import("./routes/SearchRoute.vue").then((module) => module.default) },
  { id: "records", label: "Records", load: () => import("./routes/RecordsRoute.vue").then((module) => module.default) },
  { id: "reader", label: "Reader", load: () => import("./routes/ReaderRoute.vue").then((module) => module.default) },
  { id: "editor", label: "Editor", load: () => import("./routes/EditorRoute.vue").then((module) => module.default) },
  { id: "settings", label: "Settings", load: () => import("./routes/SettingsRoute.vue").then((module) => module.default) },
  { id: "notifications", label: "Notifications", load: () => import("./routes/NotificationsRoute.vue").then((module) => module.default) },
  { id: "library", label: "Library", load: () => import("./routes/LibraryRoute.vue").then((module) => module.default) },
];

const currentId = shallowRef("dashboard");
const CurrentRoute = shallowRef(markRaw(DashboardRoute));

async function openRoute(route) {
  currentId.value = route.id;
  CurrentRoute.value = markRaw(await route.load());
}
</script>

<template>
  <div class="app-shell">
    <nav class="app-nav" aria-label="Application routes">
      <h1>Research Workspace</h1>
      <button
        v-for="route in routes"
        :key="route.id"
        :aria-current="currentId === route.id ? 'page' : undefined"
        :data-testid="`route-${route.id}`"
        @click="openRoute(route)"
      >
        {{ route.label }}
      </button>
    </nav>
    <main class="workspace">
      <component :is="CurrentRoute" />
    </main>
  </div>
</template>
