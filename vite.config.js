import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        keychain: resolve(__dirname, 'keychain.html'),
        'keychain-item': resolve(__dirname, 'keychain-item.html'),
        scrapbook: resolve(__dirname, 'scrapbook.html'),
        photoframe: resolve(__dirname, 'photoframe.html'),
        mugs: resolve(__dirname, 'mugs.html'),
        coasters: resolve(__dirname, 'coasters.html'),
        wallart: resolve(__dirname, 'wallart.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three';
          }

          if (id.includes('node_modules/gsap')) {
            return 'gsap';
          }
        }
      }
    }
  }
});
