import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Blog",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: 'deep',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'JavaScript', link: '/'},
      { text: 'CSS', link: '/'},
      {
        text: 'Chrome DevTools',
        items: [
          { text: '深度指南', link: '/chrome-devtools/开始/简介.md'},
          { text: '断点调试教程', link: '/chrome-devtools/源代码面板/调试JavaScript.md'}
        ],
        activeMatch: '/chrome-devtools/'
      }
    ],

    sidebar: {
      '/chrome-devtools/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/chrome-devtools/开始/简介.md' },
            { text: '打开 DevTools', link: '/chrome-devtools/开始/打开DevTools.md' }
          ]
        },
        {
          text: '元素面板',
          items: [
            { text: '查看 DOM', link: '/chrome-devtools/元素面板/查看DOM.md' },
            { text: '修改 DOM', link: '/chrome-devtools/元素面板/修改DOM.md' },
            { text: '控制台中访问节点', link: '/chrome-devtools/元素面板/控制台中访问节点.md' },
            { text: '查看元素的 CSS', link: '/chrome-devtools/元素面板/查看元素的CSS.md' },
            { text: '计算样式标签页', link: '/chrome-devtools/元素面板/计算样式标签页.md' },
            { text: '修改元素的 CSS', link: '/chrome-devtools/元素面板/修改元素的CSS.md' },
            { text: '检查和调试 FlexBox 布局', link: '/chrome-devtools/元素面板/检查和调试FlexBox布局.md' },
            { text: '快捷键速查表', link: '/chrome-devtools/元素面板/快捷键速查表.md' },
          ]
        },
        {
          text: '源代码面板',
          items: [
            { text: '查看和修改文件', link: '/chrome-devtools/源代码面板/查看和修改文件.md' },
            { text: '调试 JavaScript', link: '/chrome-devtools/源代码面板/调试JavaScript.md' },
            { text: '快捷键速查表', link: '/chrome-devtools/源代码面板/快捷键速查表.md' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SHFeMIX' }
    ]
  },
  base: '/Blog/'
})
