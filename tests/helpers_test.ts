import { assertEquals } from "@std/assert";
import {
  buildPageTitle,
  formatDate,
  getCanonicalUrl,
  getSearchUrl,
  groupByYear,
  paginate,
  sortPages,
  truncate,
} from "../src/mod.ts";
import type { PageIndex } from "../src/mod.ts";

const idx = (over: Partial<PageIndex>): PageIndex => ({
  sourcePath: "x",
  route: "/x",
  language: "en",
  format: "md",
  template: "default",
  title: "X",
  navTitle: "X",
  date: null,
  published: true,
  status: "published",
  visible: true,
  routable: true,
  isModule: false,
  order: 0,
  depth: 1,
  parentPath: null,
  taxonomy: {},
  ...over,
});

Deno.test("paginate clamps the page and reports neighbours", () => {
  const r = paginate([1, 2, 3, 4, 5], 9, 2);
  assertEquals(r.items, [5]);
  assertEquals([r.page, r.totalPages, r.hasNext, r.hasPrev], [
    3,
    3,
    false,
    true,
  ]);
  assertEquals(paginate([], 1, 0).totalPages, 1);
});

Deno.test("formatDate defaults to a short English date", () => {
  assertEquals(formatDate(Date.UTC(2026, 2, 12, 12), "en"), "Mar 12, 2026");
});

Deno.test("getCanonicalUrl and getSearchUrl", () => {
  assertEquals(
    getCanonicalUrl("https://e.com/", "/blog/hello/"),
    "https://e.com/blog/hello",
  );
  assertEquals(getCanonicalUrl("https://e.com", "/"), "https://e.com/");
  assertEquals(getSearchUrl("hello world"), "/search?q=hello%20world");
  assertEquals(getSearchUrl("deno", "/en/search"), "/en/search?q=deno");
});

Deno.test("sortPages puts unprefixed pages after ordered ones and does not mutate", () => {
  const pages = [
    idx({ title: "b", order: 0 }),
    idx({ title: "a", order: 2 }),
    idx({ title: "c", order: 1 }),
  ];
  assertEquals(sortPages(pages, "order").map((p) => p.title), ["c", "a", "b"]);
  assertEquals(sortPages(pages, "title", "desc").map((p) => p.title), [
    "c",
    "b",
    "a",
  ]);
  assertEquals(pages.map((p) => p.title), ["b", "a", "c"]);
});

Deno.test("groupByYear groups undated pages under 0", () => {
  const g = groupByYear([
    idx({ date: "2025-06-01" }),
    idx({ date: "2026-01-02" }),
    idx({}),
  ]);
  assertEquals(Object.keys(g).map(Number).sort(), [0, 2025, 2026]);
});

Deno.test("truncate breaks at a word boundary", () => {
  assertEquals(truncate("Hello world, how are you?", 15), "Hello world,…");
  assertEquals(truncate("Short", 100), "Short");
  assertEquals(truncate("abc", 0), "…");
});

Deno.test("buildPageTitle", () => {
  assertEquals(
    buildPageTitle({ frontmatter: { title: "A", descriptor: "B" } }, "S"),
    "A - B | S",
  );
  assertEquals(buildPageTitle({ frontmatter: { title: "A" } }, "S"), "A | S");
  assertEquals(buildPageTitle(null, "S"), "S");
});
