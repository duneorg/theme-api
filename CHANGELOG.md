# Changelog

## 1.0.0 (2026-11-10)

First release. The theme contract, extracted from `@dune/core` (`content/types`,
`theme-helpers`) so that themes depend on a leaf package instead of the CMS.

- Types: `TemplateProps`, `TemplateComponent`, `TemplateConfig`, `Page`,
  `PageIndex`, `PageFrontmatter`, `PageTranslation`, `Collection`,
  `CollectionDefinition`, `CollectionSource`, `MediaFile`, `ContentFormat`,
  `ContentHandlerContext`, `SearchResult`, `SiteConfig`, `ThemeConfig`.
- Helpers: `paginate`, `formatDate`, `getCanonicalUrl`, `getSearchUrl`,
  `sortPages`, `groupByYear`, `truncate`, `buildPageTitle`.
- Narrower than core on purpose: `SiteConfig` is `title`, `description`, `url`,
  `basePath`; `ThemeConfig` is `name`, `custom`; `PageIndex` leaves out core's
  cache and gating fields; `TemplateProps` has no `content` (the content query
  API). Core still passes the wider objects at runtime. Adding a field later is
  additive; removing one is not.
- Not included: `ContentPageProps` (the props of `.tsx` content pages, a
  site-author contract).
