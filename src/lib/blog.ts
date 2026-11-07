/** The taxonomy slug is stable; its Japanese display label may change. */
export const CLINIC_TAG = 'app-clinic';
export const PAGE_SIZE = 12;
export function pageNumber(value: string | null): number {
  if (!value || !/^[1-9]\d{0,4}$/.test(value)) return 1;
  return Number(value);
}
export function blogFilter(clinic: boolean, page = 1) {
  return {
    status: 'published' as const,
    ...(clinic ? { where: { tag: CLINIC_TAG } } : {}),
    orderBy: { published_at: 'desc' as const },
    limit: PAGE_SIZE + 1,
    offset: (page - 1) * PAGE_SIZE,
  };
}
export function postHref(post: { id: string; data: { slug?: string | null } }): string {
  return `/blog/${encodeURIComponent(post.data.slug || post.id)}`;
}
export function isClinicPost(post: { data: { terms?: Record<string, { slug: string }[]> } }): boolean {
  return post.data.terms?.tag?.some(term => term.slug === CLINIC_TAG) ?? false;
}
