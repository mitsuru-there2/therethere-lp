import type { TextPart } from '../data/types';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

export function renderParts(parts: readonly TextPart[]): string {
  return parts.map((part) => {
    if (typeof part === 'string') return escapeHtml(part);
    if ('br' in part) {
      const className = part.br === 'always' ? '' : ` class="${part.br}-break"`;
      return `<br${className}>`;
    }
    const href = escapeHtml(part.href);
    const external = part.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const newTab = part.newTab ? `<span class="sr-only">${escapeHtml(part.newTab)}</span>` : '';
    return `<a href="${href}"${external}>${escapeHtml(part.label)}${newTab}</a>`;
  }).join('');
}
