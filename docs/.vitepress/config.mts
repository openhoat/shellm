import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SheLLM',
  description: 'AI-Powered Terminal — Generate shell commands from natural language',
  base: '/shellm/',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/shellm/logo.svg' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Configuration', link: '/guide/configuration' },
      {
        text: 'v1.1.0',
        link: 'https://github.com/openhoat/shellm/releases/tag/v1.1.0',
      },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is SheLLM?', link: '/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'User Guide',
        items: [
          { text: 'Usage', link: '/guide/usage' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Build Executables', link: '/guide/build' },
        ],
      },
      {
        text: 'Help',
        items: [
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Contributing', link: '/guide/contributing' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/openhoat/shellm' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Olivier Penhoat',
    },
    editLink: {
      pattern: 'https://github.com/openhoat/shellm/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
