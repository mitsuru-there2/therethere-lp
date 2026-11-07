import { defineMiddleware } from 'astro:middleware';
import { legacyRedirects } from './lib/redirects';
export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
  const target = legacyRedirects[url.pathname];
  if (target) return redirect(target + url.search, 301);
  const response = await next();
  if (!url.pathname.startsWith('/_emdash')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Frame-Options', 'DENY');
  }
  if (url.pathname.replace(/\/$/, '') === '/about' || url.pathname === '/images/operator.png') response.headers.set('X-Robots-Tag', 'noindex, follow');
  return response;
});
