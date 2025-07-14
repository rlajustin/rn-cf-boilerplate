import DefaultTheme from "vitepress/theme";
import DocNavButton from "./DocNavButton.vue";
import "./custom.css";

import type { Theme, EnhanceAppContext } from "vitepress";

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    if (DefaultTheme.enhanceApp) DefaultTheme.enhanceApp(ctx);
    ctx.app.component("DocNavButton", DocNavButton);
  },
};

export default theme;
