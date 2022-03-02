import type { SidebarConfig } from "vuepress-theme-gungnir";

export const zh: SidebarConfig = {
  "/docs/": [
    {
      text: "基础",
      children: ["/zh/docs/intro.md"]
    },
    {
      text: "插件",
      children: [
        "/en/docs/plugins/intro.md",
        "/en/docs/plugins/giscus.md",
        "/en/docs/plugins/chart.md",
        "/en/docs/plugins/mermaid.md",
        "/en/docs/plugins/katex.md",
        "/en/docs/plugins/reading-time.md",
        "/en/docs/plugins/baidu-tongji.md",
        "/en/docs/plugins/md-plus.md"
      ]
    }
  ]
};
