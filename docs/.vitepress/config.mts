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
      { text: 'Home', link: '/' },
      { text: 'Chrome DevTools 完全指南', link: '/chrome-devtools/概览/README.md' }
    ],

    sidebar: [
      {
        text: 'Chrome DevTools 完全指南',
        items: [
          { text: '概览', link: '/chrome-devtools/概览/README.md' },
          { text: '元素面板', link: '/chrome-devtools/元素面板/README.md' },
          { text: '源代码面板', link: '/chrome-devtools/源代码面板/README.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SHFeMIX' }
    ]
  },
  base: '/Blog/'
})
