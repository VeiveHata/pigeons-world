import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import PigeonsPage from "./pages/PigeonsPage.vue";
import SucculentsPage from "./pages/SucculentsPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
    description: string;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
      meta: {
        title: "Trying 2B Happy",
        description: "Trying 2B Happy for Everyone!",
      },
    },
    {
      path: "/pigeons",
      component: PigeonsPage,
      meta: {
        title: "Pigeons World",
        description: "Pigeons World for Everyone!",
      },
    },
    {
      path: "/succulents",
      component: SucculentsPage,
      meta: {
        title: "Succulents World",
        description: "Succulents World for Everyone!",
      },
    },
  ],
});

// Replaces Qwik City's per-route `head` export.
router.afterEach((to) => {
  document.title = to.meta.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", to.meta.description);
});

export default router;
