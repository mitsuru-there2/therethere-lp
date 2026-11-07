import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blogFilter, isClinicPost, postHref, pageNumber, PAGE_SIZE } from '../src/lib/blog';
import { legacyRedirects } from '../src/lib/redirects';
test('clinic filtering happens in the CMS query before pagination; drafts are excluded', () => {
  assert.deepEqual(blogFilter(true, 2), { status: 'published', where: { tag: 'app-clinic' }, orderBy: { published_at: 'desc' }, limit: PAGE_SIZE + 1, offset: PAGE_SIZE });
  assert.equal('where' in blogFilter(false), false);
});
test('only the actual tag slug identifies clinic posts', () => {
  assert.equal(isClinicPost({ data: { terms: { tag: [{ slug: 'app-clinic' }] } } }), true);
  assert.equal(isClinicPost({ data: { terms: { category: [{ slug: 'app-clinic' }] } } }), false);
  assert.equal(isClinicPost({ data: { terms: { tag: [{ slug: 'app-clinic-other' }] } } }), false);
  assert.equal(isClinicPost({ data: {} }), false);
});
test('articles have one canonical URL, using their slug when present', () => {
  assert.equal(postHref({ id: '123', data: { slug: 'first-post' } }), '/blog/first-post');
  assert.equal(postHref({ id: '123', data: {} }), '/blog/123');
  assert.equal(postHref({ id: '123', data: { slug: 'テスト' } }), '/blog/%E3%83%86%E3%82%B9%E3%83%88');
});
test('invalid page numbers cannot produce negative or unbounded query offsets', () => {
  for (const input of [null, '', '-1', '0', '1.2', 'NaN', '100000', '1x']) assert.equal(pageNumber(input), 1);
  assert.equal(pageNumber('2'), 2);
});
test('all old Japanese routes and original privacy aliases keep their meaning', () => {
  for (const path of ['recorder', 'checklist', 'recorder/privacy', 'checklist/privacy', 'site-privacy']) {
    assert.equal(legacyRedirects[`/ja/${path}`], `/${path}`);
    assert.equal(legacyRedirects[`/ja/${path}/`], `/${path}`);
  }
  assert.equal(legacyRedirects['/ja'], '/');
  assert.equal(legacyRedirects['/privacy'], '/recorder/privacy');
  assert.equal(legacyRedirects['/app-clinic/about'], '/about');
});
