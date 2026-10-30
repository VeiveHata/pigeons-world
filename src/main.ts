import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "@fontsource/special-elite/400.css";
import "./global.css";

createApp(App).use(router).mount("#app");

// Let a sign's swing finish even when the pointer leaves it: :hover alone would cut it short.
document.addEventListener("mouseover", (event) => {
  const sign = (event.target as Element | null)?.closest?.(".sign.sway");
  if (sign) sign.classList.add("swaying");
});
document.addEventListener("animationend", (event) => {
  if (event.animationName === "sway") {
    (event.target as Element).classList.remove("swaying");
  }
});
