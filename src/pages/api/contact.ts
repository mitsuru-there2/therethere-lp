import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleContact } from '../../../worker/index';
export const ALL: APIRoute = ({ request }) => handleContact(request, { ...env, ASSETS: { fetch: () => Promise.resolve(new Response('', { status: 404 })) } });
