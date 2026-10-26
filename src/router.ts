import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import PigeonsPage from "./pages/PigeonsPage.vue";
import PlantsPage from "./pages/PlantsPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
    description: string;
    // Page background class; it runs behind the see-through header too.
    background?: string;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
      meta: {
        title: "DoToDo",
        description: "DoToDo for Learning!",
        background: "bg-dove",
      },
    },
    {
      path: "/pigeons",
      component: PigeonsPage,
      meta: {
        title: "Pigeons World",
        description: "Pigeons World for Learning!",
        background: "bg-pigeon",
      },
    },
    {
      path: "/plants",
      component: PlantsPage,
      meta: {
        title: "Plants World",
        description: "Plants World for Learning!",
        background: "bg-room",
      },
    },
  ],
});

// Replaces Qwik City's per-route `head` export.
router.afterEach((to) => {
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", to.meta.description);
});

export default router;
