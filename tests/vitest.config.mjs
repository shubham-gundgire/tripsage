import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformWithOxc } from 'vite'
import { defineConfig } from 'vitest/config'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..')

const shared = {
  plugins: [
    {
      // The app writes JSX in .js files, as Next allows; Vite only expects it in .jsx/.tsx.
      name: 'jsx-in-js',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.js') || id.includes('node_modules') || !id.startsWith(repo)) return null
        if (!/<[A-Za-z>]/.test(code)) return null
        return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } })
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${repo}/` },
    ],
    // React comes from the app's node_modules only: tests/.npmrc sets legacy-peer-deps, so the
    // test package does not install its own copy for Testing Library (two Reacts break hooks).
    dedupe: ['react', 'react-dom'],
    extensions: ['.js', '.mjs', '.jsx', '.json'],
  },
}

export default defineConfig({
  ...shared,
  // Tailwind's PostCSS config is for the Next build, not for tests.
  css: { postcss: { plugins: [] } },
  test: {
    root: repo,
    // Each project inherits the plugins, aliases and CSS settings above.
    projects: [
      {
        test: {
          name: 'server',
          root: repo,
          environment: 'node',
          include: ['tests/server/**/*.test.js'],
          setupFiles: ['tests/setup/server.js'],
        },
      },
      {
        test: {
          name: 'ui',
          root: repo,
          environment: 'jsdom',
          include: ['tests/ui/**/*.test.{js,jsx}'],
          setupFiles: ['tests/setup/ui.jsx'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: path.join(here, 'coverage'),
      include: ['app/**/*.{js,jsx}', 'lib/**/*.js', 'supabase-service-client.js'],
      exclude: ['app/data/**'],
    },
  },
})
