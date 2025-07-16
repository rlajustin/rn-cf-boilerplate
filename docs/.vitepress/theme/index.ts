import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import TitleUpdater from "./TitleUpdater.vue";
import DocNavButton from "./DocNavButton.vue";
import type { Theme, EnhanceAppContext } from "vitepress";
import "./custom.css";

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    if (DefaultTheme.enhanceApp) DefaultTheme.enhanceApp(ctx);
    ctx.app.component("DocNavButton", DocNavButton);
  },
  Layout: (props) => h("div", [h(TitleUpdater), h(DefaultTheme.Layout, props)]),
};

export default theme;
