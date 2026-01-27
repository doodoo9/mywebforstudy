import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
    plugins: [cesium()],
    server: {
        proxy: {
            '/tts': 'http://localhost:5000'
        }
    }
});
