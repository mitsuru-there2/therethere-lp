import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';
import { postHref } from '../lib/blog';
export const GET: APIRoute = async ({ site }) => {
  const paths = ['/', '/recorder', '/checklist', '/recorder/privacy', '/checklist/privacy', '/site-privacy', '/app-clinic', '/app-clinic/terms', '/blog', '/app-clinic/blog'];
  for (let offset = 0; ; offset += 100) {
    const { entries, error } = await getEmDashCollection('posts', { status: 'published', limit: 100, offset });
    if (error) return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    paths.push(...entries.map(postHref));
    if (entries.length < 100) break;
  }
  const xml = paths.map(path => `<url><loc>${new URL(path, site).href.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
