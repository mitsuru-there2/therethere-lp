import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';
export default defineConfig({
  site: 'https://therethere.studio', output: 'server', adapter: cloudflare(),
  integrations: [react(), emdash({ database: d1({ binding: 'DB' }), storage: r2({ binding: 'MEDIA' }) })],
  trailingSlash: 'never', devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
