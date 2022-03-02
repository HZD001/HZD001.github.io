import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'
import { navbar, sidebar } from "./configs";
import { config } from "./configs/config"

export default defineUserConfig<DefaultThemeOptions>({
  // 站点配置 https://v2.vuepress.vuejs.org/zh/reference/config.html#description
  lang: 'zh-CN',
  title: config.title,
  description: 'Just playing around',
  // 部署站点的基础路径。
  base:'/',
  // head
  head: [['link', { rel: 'icon', href: '/image/logo/android-chrome-144x144.png' }]],
  // 多语言
  locales: config.languages,
  // 主题和它的配置
  theme: '@vuepress/theme-default',
  themeConfig: {
    // Public 文件路径
    logo: '/image/logo/android-chrome-144x144.png', // https://vuejs.org/images/logo.png | /images/hero.png
    locales: {
      '/': {
        // 多语言下拉菜单的标题
        selectLanguageText: '简体中文',
        // 该语言在下拉菜单中的标签
        selectLanguageName: '简体中文',
        
        navbar: navbar.zh,
      },
      '/en/': {
        // selectText: '请问',
        selectLanguageText: 'English',
        selectLanguageName: 'English',
        navbar: navbar.en,
      }
    },
  },
  plugins: [
    [
      '@vuepress/plugin-search',
      {
        locales: {
          '/': {
            placeholder: 'Search',
          },
          '/zh/': {
            placeholder: '搜索',
          },
        },
      },
    ],
  ],
})