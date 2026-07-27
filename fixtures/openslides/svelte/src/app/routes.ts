/**
 * Route table for the hash router — svelte-spa-router drives
 * `location.hash`, so the app's URLs are /#/ and /#/editor/:projectId.
 */
import { wrap } from "svelte-spa-router/wrap";
import Redirect from "$lib/components/Redirect.svelte";

export const routes = {
  "/": wrap({
    asyncComponent: () => import("@/features/dashboard/Dashboard.svelte"),
  }),
  "/editor/:projectId": wrap({
    asyncComponent: () => import("@/features/editor/Editor.svelte"),
  }),
  "*": Redirect,
};
