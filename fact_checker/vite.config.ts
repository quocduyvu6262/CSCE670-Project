import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './src/manifest'

export default defineConfig({
    plugins: [
        react(),
        crx({ manifest }),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                offscreen: 'src/offscreen/offscreen.html',
            },
        },
    },
})
