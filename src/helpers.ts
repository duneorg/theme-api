/**
 * Pure helpers for theme templates.
 *
 * @module
 */

import type { PageFrontmatter, PageIndex } from "./types.ts";

/** Result of paginating an array. */
export interface PaginationResult<T> {
  /** Items on the current page. */
  items: T[];
  /** Current page number (1-based). */
  page: number;
  /** Items per page. */
  perPage: number;
  /** Total number of items across all pages. */
  total: number;
  /** Total number of pages. */
  totalPages: number;
  /** Whether there is a next page. */
  hasNext: boolean;
  /** Whether there is a previous page. */
  hasPrev: boolean;
}

/**
 * Paginate an array.
 *
 * @param items   Full array to paginate.
 * @param page    Current page number (1-based). Clamped to [1, totalPages].
 * @param perPage Items per page (minimum 1).
 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): PaginationResult<T> {
  const safePerPage = Math.max(1, Math.floor(perPage));
  const totalPages = Math.max(1, Math.ceil(items.length / safePerPage));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safePerPage;
  return {
    items: items.slice(start, start + safePerPage),
    page: safePage,
    perPage: safePerPage,
    total: items.length,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

/**
 * Format a Unix millisecond timestamp as a localised date string.
 *
 * @param timestamp Milliseconds since epoch.
 * @param locale    BCP-47 locale tag. Defaults to `"en"`.
 * @param options   `Intl.DateTimeFormatOptions`. Defaults to day, short month, year.
 */
export function formatDate(
  timestamp: number,
  locale = "en",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(timestamp));
}

/**
 * Combine a site's base URL with a request pathname. The result never ends
 * with `/` unless it is exactly the site root.
 *
 * @example
 * getCanonicalUrl("https://example.com", "/blog/hello/") // "https://example.com/blog/hello"
 */
export function getCanonicalUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  return `${base}${path}`;
}

/**
 * URL of the built-in `/search` page with the query pre-filled.
 *
 * @param query Search query string.
 * @param base  Base path of the search page. Defaults to `"/search"`.
 */
export function getSearchUrl(query: string, base?: string): string {
  return `${base ?? "/search"}?q=${encodeURIComponent(query)}`;
}

/** Unprefixed items (order 0) sort after explicitly ordered ones. */
function effectiveOrder(order: number): number {
  return order > 0 ? order : Number.MAX_SAFE_INTEGER;
}

/**
 * Sort pages by a field. The original array is not mutated.
 *
 * @param field `"title"` | `"date"` | `"order"`.
 * @param dir   `"asc"` | `"desc"`.
 */
export function sortPages(
  pages: PageIndex[],
  field: "title" | "date" | "order",
  dir: "asc" | "desc" = "asc",
): PageIndex[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...pages].sort((a, b) => {
    if (field === "title") return sign * a.title.localeCompare(b.title);
    if (field === "date") {
      const ad = a.date ? new Date(a.date).getTime() : 0;
      const bd = b.date ? new Date(b.date).getTime() : 0;
      return sign * (ad - bd);
    }
    return sign * (effectiveOrder(a.order) - effectiveOrder(b.order));
  });
}

/**
 * Group pages by the year of their `date`. Pages without a date go under `0`.
 * Object keys sort numerically regardless of insertion order; sort the keys
 * yourself to iterate in a specific order.
 */
export function groupByYear(pages: PageIndex[]): Record<number, PageIndex[]> {
  const groups: Record<number, PageIndex[]> = {};
  for (const page of pages) {
    const year = page.date ? new Date(page.date).getFullYear() : 0;
    (groups[year] ??= []).push(page);
  }
  return groups;
}

/**
 * Truncate a string to at most `length` characters (suffix included),
 * breaking at the last word boundary within that limit.
 *
 * @param suffix Appended when truncation occurs. Defaults to `"…"`.
 */
export function truncate(text: string, length: number, suffix = "…"): string {
  if (text.length <= length) return text;
  const available = length - suffix.length;
  if (available <= 0) return suffix;
  const cut = text.slice(0, available);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + suffix;
}

/**
 * Build the `<title>` text: "Title - Descriptor | Site Name". A page without
 * a title yields just the site name.
 */
export function buildPageTitle(
  page:
    | { frontmatter: Pick<PageFrontmatter, "title" | "descriptor"> }
    | undefined
    | null,
  siteName: string,
): string {
  if (!page?.frontmatter?.title) return siteName;
  const { title, descriptor } = page.frontmatter;
  const pagePart = descriptor ? `${title} - ${descriptor}` : title;
  return `${pagePart} | ${siteName}`;
}
