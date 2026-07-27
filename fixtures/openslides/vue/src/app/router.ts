import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "@/features/dashboard/Dashboard.vue";
import Editor from "@/features/editor/Editor.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/editor/:projectId",
      name: "editor",
      component: Editor,
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
