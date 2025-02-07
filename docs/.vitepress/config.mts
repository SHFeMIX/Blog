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
      { text: 'JavaScript', link: '/' },
      { text: 'CSS', 
        link: '/CSS权威指南/如何看待CSS.md',
        activeMatch: '/CSS权威指南/' 
      },
      { 
        text: 'Vue.js 渐进式实现',
        link: '/Vue.js 渐进式实现/响应式系统/0 响应式数据基本实现.md'
      },
      {
        text: 'Chrome DevTools',
        items: [
          { text: '深度指南', link: '/chrome-devtools/开始/简介.md' },
          { text: '断点调试详解', link: '/chrome-devtools/源代码面板/调试JavaScript.md' }
        ],
        activeMatch: '/chrome-devtools/'
      },
      { text: 'Git', link: '/pro-git/1 起步/1.3 Git是什么.md' }
    ],

    sidebar: {
      '/chrome-devtools/': [
        {
          text: '快速开始',
          items: [
            { text: '简介', link: '/chrome-devtools/开始/简介.md' },
            { text: '打开 DevTools', link: '/chrome-devtools/开始/打开DevTools.md' },
            { text: '使用命令操作', link: '/chrome-devtools/开始/使用命令操作.md' }
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
            { text: '查看和编辑文件', link: '/chrome-devtools/源代码面板/查看和编辑文件.md' },
            { text: '调试 JavaScript', link: '/chrome-devtools/源代码面板/调试JavaScript.md' },
            { text: '快捷键速查表', link: '/chrome-devtools/源代码面板/快捷键速查表.md' },
          ]
        }
      ],
      '/pro-git/': [
        {
          text: '起步',
          items: [
            { text: 'Git 是什么', link: '/pro-git/1 起步/1.3 Git是什么.md' },
            { text: '命令行', link: '/pro-git/1 起步/1.4 命令行.md' },
            { text: '初次运行 Git 前的配置', link: '/pro-git/1 起步/1.6 初次运行Git前的配置.md' },
            { text: '获取帮助', link: '/pro-git/1 起步/1.7 获取帮助.md' },
          ]
        },
        {
          text: 'Git 基础',
          items: [
            { text: '获取 Git 仓库', link: '/pro-git/2 Git 基础/2.1 获取Git仓库.md'},
            { text: '记录每次更新到仓库', link: '/pro-git/2 Git 基础/2.2 记录每次更新到仓库.md'},
            { text: '查看提交历史', link: '/pro-git/2 Git 基础/2.3 查看提交历史.md'},
            { text: '撤销操作', link: '/pro-git/2 Git 基础/2.4 撤销操作.md'},
            { text: '远程仓库的使用', link: '/pro-git/2 Git 基础/2.5 远程仓库的使用.md'}, 
            { text: '给提交打标签', link: '/pro-git/2 Git 基础/2.6 给提交打标签.md'},
          ]
        },
        {
          text: 'Git 分支',
          items: [
            { text: '分支简介', link: '/pro-git/3 Git 分支/3.1 分支简介.md'},
            { text: '分支的新建与合并', link: '/pro-git/3 Git 分支/3.2 分支的新建与合并.md'},
            { text: '分支管理', link: '/pro-git/3 Git 分支/3.3 分支管理.md'},
            { text: '远程分支', link: '/pro-git/3 Git 分支/3.5 远程分支.md'},
            { text: '变基 (rebase)', link: '/pro-git/3 Git 分支/3.6 变基.md'},
          ]
        }
      ],
      '/CSS权威指南/': [
        { text: '如何看待 CSS', link:'/CSS权威指南/如何看待CSS.md' },
        { text: 'CSS 与文档',
          items: [
            { text: '元素', link: '/CSS权威指南/1 CSS与文档/1.2 元素.md'},
            { text: '把 CSS 应用到 HTML 上', link: '/CSS权威指南/1 CSS与文档/1.3 把CSS应用到HTML上.md'},
            { text: '样式表中的内容', link: '/CSS权威指南/1 CSS与文档/1.4 样式表中的内容'},
            { text: '媒体查询', link: '/CSS权威指南/1 CSS与文档/1.5 媒体查询.md'},
            { text: '特性查询', link: '/CSS权威指南/1 CSS与文档/1.6 特性查询.md'},
          ]
        },
        {
          text: 'CSS 选择器',
          items: [
            { text: '样式的基本规则', link: '/CSS权威指南/2 CSS选择器/2.1 样式的基本规则.md'},
            { text: '群组选择器', link: '/CSS权威指南/2 CSS选择器/2.2 群组选择器.md'},
            { text: '类选择器与ID选择器', link: '/CSS权威指南/2 CSS选择器/2.3 类选择器与ID选择器.md'},
            { text: '属性选择器', link: '/CSS权威指南/2 CSS选择器/2.4 属性选择器.md'},
            { text: '文档结构选择器', link: '/CSS权威指南/2 CSS选择器/2.5 文档结构选择器.md'},
            { text: '伪类选择器', link: '/CSS权威指南/2 CSS选择器/2.6 伪类选择器.md'},
            { text: '伪元素选择器', link: '/CSS权威指南/2 CSS选择器/2.7 伪元素选择器.md'},
            { text: '小结', link: '/CSS权威指南/2 CSS选择器/2.8 小结.md'},
          ]
        },
        {
          text: '特指度和层叠', 
          items:  [
            { text: '特指度', link: '/CSS权威指南/3 特指度和层叠/3.1 特指度.md'},
            { text: '继承', link: '/CSS权威指南/3 特指度和层叠/3.2 继承.md'},
            { text: '层叠', link: '/CSS权威指南/3 特指度和层叠/3.3 层叠.md'},
          ]
        },
        {
          text: '值和单位',
          items: [
            { text: '关键字、字符串和其他文本值', link: '/CSS权威指南/4 值和单位/4.1 关键字、字符串和其他文本值.md'},
            { text: '长度单位', link: '/CSS权威指南/4 值和单位/4.3 长度单位.md'},
            { text: '计算值', link: '/CSS权威指南/4 值和单位/4.4 计算值.md'},
            { text: '属性值', link: '/CSS权威指南/4 值和单位/4.5 属性值.md'},
            { text: '颜色值', link: '/CSS权威指南/4 值和单位/4.6 颜色值.md'},
            { text: '角度值', link: '/CSS权威指南/4 值和单位/4.7 角度值.md'},
            { text: '时间和频率', link: '/CSS权威指南/4 值和单位/4.8 时间和频率.md'},
            { text: '位置', link: '/CSS权威指南/4 值和单位/4.9 位置.md'}, 
            { text: '自定义值', link: '/CSS权威指南/4 值和单位/4.10 自定义值.md'},
          ]
        },
        {
          text: '字体',
          items: [
            { text: '字体族', link: '/CSS权威指南/5 字体/5.1 字体族.md'},
            { text: '自定义字体', link: '/CSS权威指南/5 字体/5.2 自定义字体.md'},
          ]
        }
      ],
      'Vue.js 渐进式实现': [
        {
          text: '响应式系统',
          items: [
            { text: '响应式数据基本实现', link: '/Vue.js 渐进式实现/响应式系统/0 响应式数据基本实现.md'},
            { text: 'effect 函数注册副作用', link: '/Vue.js 渐进式实现/响应式系统/1 effect 函数注册副作用.md'},
            { text: '建立副作用函数与被操作字段之间的联系', link: '/Vue.js 渐进式实现/响应式系统/2 建立副作用函数与被操作字段之间的联系.md'},
            { text: '封装 track 和 trigger 函数', link: '/Vue.js 渐进式实现/响应式系统/3 封装 track 和 trigger 函数.md'}
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SHFeMIX' }
    ]
  },
  base: '/Blog/',
  lastUpdated: true
})
