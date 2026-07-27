import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("@/features/dashboard/Dashboard.vue"),
    },
    {
      path: "/editor/:projectId",
      name: "editor",
      component: () => import("@/features/editor/Editor.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
