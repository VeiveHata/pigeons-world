import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "@fontsource/special-elite/400.css";
import "./global.css";

createApp(App).use(router).mount("#app");
