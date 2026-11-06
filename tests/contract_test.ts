import { assertEquals } from "@std/assert";
import type { TemplateComponent, TemplateProps } from "../src/mod.ts";

// A theme template, written the way the 61 first-party themes write theirs:
// `TemplateProps` intersected with the theme's own extra props.
function Blog(props: TemplateProps & { pagination?: { newer?: string } }) {
  const { page, collection, nav, t, site, config } = props;
  return [
    page.frontmatter.title,
    collection?.items.length ?? 0,
    nav.map((n) => n.route),
    t("read_more", "Read more"),
    site.url + (site.basePath ?? ""),
    config.theme.name,
  ];
}

Deno.test("a template with extra theme props is a TemplateComponent", () => {
  const asComponent: TemplateComponent = Blog;
  assertEquals(typeof asComponent, "function");
});

Deno.test("the package imports nothing from @dune/*", async () => {
  for await (const e of Deno.readDir(new URL("../src", import.meta.url))) {
    const text = await Deno.readTextFile(
      new URL(`../src/${e.name}`, import.meta.url),
    );
    assertEquals(
      /from\s+["']@dune\//.test(text) || /import\(["']@dune\//.test(text),
      false,
      e.name,
    );
  }
});
