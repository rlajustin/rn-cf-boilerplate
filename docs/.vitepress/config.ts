import { defineConfig } from "vitepress";

const base = "/rn-cf-docs";

export default defineConfig({
  base,
  lang: "en-US",
  title: "RN/CF Boilerplate Docs",
  description: "Documentation for my awesome boilerplate",

  // Base URL if deploying to a subdirectory
  // base: '/my-repo-name/',

  themeConfig: {
    // logo: "logo.png",

    // Enable table of contents in sidebar
    outline: {
      level: [2, 3],
      label: "Contents",
    },

    // Navigation
    nav: [
      { text: "Home", link: "/" },
      { text: "Get Started", link: "/guide/introduction" },
    ],

    // Sidebar
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Setup", link: "/guide/setup" },
          ],
        },
        {
          text: "Development",
          items: [
            { text: "Project Structure", link: "/guide/project-structure" },
            { text: "Development Workflow", link: "/guide/development-workflow" },
            { text: "Troubleshooting", link: "/guide/troubleshooting" },
          ],
        },
        { items: [{ text: "Security Reference", link: "/guide/security" }] },
        { text: "Acknowledgements", link: "/guide/acknowledgements" },
        { text: "License", link: "/guide/license" },
      ],
    },

    // Footer
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 Justin Kim",
    },

    // Search
    search: {
      provider: "local",
    },
  },

  // Head tags
  head: [["link", { rel: "icon", href: `${base}/logo.png` }]],
});
