import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  css: {
    preprocessorOptions: {
      sass: { loadPaths: [process.cwd()] },
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({ sassVariables: 'src/css/quasar.variables.sass' }),
  ],
})
