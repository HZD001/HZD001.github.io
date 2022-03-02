import type { NavbarConfig } from "vuepress-theme-gungnir";
// import { version } from "../meta";

export const zh: NavbarConfig = [
  {
    text: '分类',
    link: '/foo/',
  },
  // 嵌套 Group - 最大深度为 2
  {
    text: '分组',
    children: [
      {
        text: '分组名', // 分组名称
        children: ['/group/sub/foo.md', '/group/sub/bar.md'],
      },
    ],
  },
  // 控制元素何时被激活
  {
    text: '分组 2',
    children: [
      {
        text: '总是活跃的',
        link: '/',
        // 该元素将一直处于激活状态
        activeMatch: '/',
      },
      {
        text: 'Active on /foo/',
        link: '/not-foo/',
        // 该元素在当前路由路径是 /foo/ 开头时激活
        // 支持正则表达式
        activeMatch: '^/foo/',
      },
    ],
  },
];
