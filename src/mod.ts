/**
 * @dune/theme-api: the contract between Dune and its themes.
 *
 * The types a template is written against (`TemplateProps` and what it
 * carries) and the pure helpers a template may call. A leaf package: it
 * depends on neither `@dune/core` nor `@dune/plugin-api`.
 *
 * @module
 */

export type {
  Collection,
  CollectionDefinition,
  CollectionSource,
  ContentFormat,
  ContentHandlerContext,
  MediaFile,
  Page,
  PageFrontmatter,
  PageIndex,
  PageTranslation,
  SearchResult,
  SiteConfig,
  TemplateComponent,
  TemplateConfig,
  TemplateProps,
  ThemeConfig,
} from "./types.ts";

export {
  buildPageTitle,
  formatDate,
  getCanonicalUrl,
  getSearchUrl,
  groupByYear,
  paginate,
  type PaginationResult,
  sortPages,
  truncate,
} from "./helpers.ts";
