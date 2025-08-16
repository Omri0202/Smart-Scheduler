import { defineConfig } from 'vite'

export default defineConfig({
  // Build configuration
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true, // Don't try other ports if 5173 is busy
    headers: {
      // Security headers for development
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  
  // Preview server configuration 
  preview: {
    port: 4173,
    headers: {
      // Security headers for preview
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY', 
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self' https://api.together.xyz https://www.googleapis.com; img-src 'self' data:;",
    },
  },
  
  // Environment variables configuration
  envPrefix: 'VITE_',
})