import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
        providers: resolve(__dirname, 'src/providers/index.ts'),
        hooks: resolve(__dirname, 'src/hooks/index.ts'),
        types: resolve(__dirname, 'src/types/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'es.js' : 'js';
        return `${entryName}.${extension}`;
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@reduxjs/toolkit',
        'react-redux',
        '@supabase/supabase-js',
        'react-router-dom',
      ],
      output: {
        assetFileNames: 'style.[ext]', // Output CSS to style.css
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@reduxjs/toolkit': 'ReduxToolkit',
          'react-redux': 'ReactRedux',
          '@supabase/supabase-js': 'Supabase',
          'react-router-dom': 'ReactRouterDOM',
        },
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
