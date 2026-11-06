/**
 * The types a Dune theme template is written against.
 *
 * Declared here, not imported from `@dune/core`: this package is a leaf. Core
 * imports it and type-tests that what it hands a template is assignable to
 * these declarations, and that a template written against them is accepted by
 * core's `TemplateComponent`.
 *
 * @module
 */

// === Content ===

/** Content format discriminator. */
export type ContentFormat = "md" | "tsx" | "mdx";

/** Raw frontmatter parsed from YAML (.md/.mdx) or extracted from an export (.tsx). */
export interface PageFrontmatter {
  title: string;
  /** Short descriptor shown after the title in the browser tab: "Title - Descriptor | Site Name". */
  descriptor?: string;
  /** Navigation label override, shown in nav instead of the title. */
  nav_title?: string;
  /** Page heading override, shown as the h1 instead of the title. */
  heading?: string;
  slug?: string;
  /** Explicit sort order. Overrides the numeric folder/filename prefix when set. */
  order?: number;
  template?: string;
  /** Layout control (TSX content files): string = named layout, false = no layout. */
  layout?: string | false;
  published?: boolean;
  /** Content workflow status. */
  status?: "draft" | "in_review" | "published" | "archived";
  date?: string;
  /** Last editorial modification date (ISO 8601). */
  dateModified?: string;
  publish_date?: string;
  unpublish_date?: string;
  visible?: boolean;
  routable?: boolean;
  taxonomy?: Record<string, string[]>;
  metadata?: Record<string, string>;
  routes?: {
    aliases?: string[];
    canonical?: string;
  };
  summary?: {
    size?: number;
    format?: "short" | "long";
  };
  cache?: {
    enable?: boolean;
    lifetime?: number;
  };
  collection?: CollectionDefinition;
  /**
   * Several named collections (name → definition), passed to templates as
   * `props.collections`.
   */
  collections?: Record<string, CollectionDefinition>;
  /**
   * Per-page/per-section theme config override, shallow-merged over the
   * site-level `data/theme-config.json` values (nearest ancestor wins).
   */
  theme_config?: Record<string, unknown>;
  /** Declares this page as the term page for a taxonomy term. */
  termPageFor?: string | Record<string, string>;
  custom?: Record<string, unknown>;
  /** Visual Page Builder sections (present when `layout: "page-builder"`). */
  sections?: Array<{ id: string; type: string; [field: string]: unknown }>;
  /** Additional fields beyond the spec. */
  [key: string]: unknown;
}

/** A co-located media file. */
export interface MediaFile {
  /** Filename: "cover.jpg". */
  name: string;
  /** Full path relative to the content root. */
  path: string;
  /** MIME type. */
  type: string;
  /** File size in bytes. */
  size: number;
  /** Sidecar metadata (from `.meta.yaml`). */
  meta: Record<string, unknown>;
  /** URL to serve this file. */
  url: string;
}

/** Context passed to Fresh-style `handler` exports in `.tsx` content pages. */
export interface ContentHandlerContext {
  /** The incoming request. */
  req: Request;
  /** Parsed URL of the request. */
  url: URL;
  /** URL path parameters (always `{}` for content pages). */
  params: Record<string, string>;
  /** Render the page component with the given data; the data arrives as `props.data`. */
  render: (data: unknown) => Promise<Response>;
  /**
   * Same-origin CSRF check for mutating requests. Returns a 403 response for a
   * cross-site request, `null` otherwise.
   */
  csrfCheck: () => Response | null;
}

/** A fully resolved page (loaded on demand). */
export interface Page {
  /** Unique path relative to the content root: "02.blog/01.hello-world". */
  sourcePath: string;
  /** URL route: "/blog/hello-world". */
  route: string;
  /** Language code. */
  language: string;
  /** Content format: "md", "tsx" or "mdx". */
  format: ContentFormat;
  /** Resolved template name: "post" (for .md/.mdx) or "self" (for .tsx). */
  template: string;
  /** Navigation label; falls back to the title when `nav_title` is not set. */
  navTitle: string;
  /** Parsed frontmatter. */
  frontmatter: PageFrontmatter;
  /** Raw markdown body; only for .md/.mdx. */
  rawContent: string | null;
  /** Rendered HTML (lazy, cached); for .md/.mdx pages. */
  html: () => Promise<string>;
  /** Component of a .tsx page (dynamically imported). */
  component: () => Promise<TemplateComponent | null>;
  /** Fresh-style request handlers exported from a .tsx content page. */
  handlers: () => Promise<
    Record<
      string,
      (req: Request, ctx: ContentHandlerContext) => Response | Promise<Response>
    > | null
  >;
  /** Co-located media files. */
  media: MediaFile[];
  /** Navigation order (numeric prefix, or frontmatter). */
  order: number;
  /** Depth in the content tree. */
  depth: number;
  /** Whether this is a modular section. */
  isModule: boolean;
  /** Child module pages (for a modular parent). */
  modules: () => Promise<Page[]>;
  /** Parent page. */
  parent: () => Promise<Page | null>;
  /** Child pages. */
  children: () => Promise<Page[]>;
  /** Sibling pages. */
  siblings: () => Promise<Page[]>;
  /** Summary/excerpt. */
  summary: () => Promise<string>;
  /**
   * Plain-text excerpt, populated after the page was loaded through a
   * collection. Undefined outside a collection; use `await page.summary()`.
   */
  excerpt?: string;
}

/**
 * Lightweight page reference used for navigation and listings (never loads
 * the page body). This is the part of core's index entry a theme may rely on;
 * core's own entry carries more (cache keys, gating) that is not part of the
 * contract.
 */
export interface PageIndex {
  sourcePath: string;
  route: string;
  /** Language code. */
  language: string;
  format: ContentFormat;
  template: string;
  title: string;
  /** Navigation label; falls back to the title when `nav_title` is not set. */
  navTitle: string;
  date: string | null;
  /** `YYYY-MM-DD` from the `dateModified` frontmatter field, when present and valid. */
  dateModified?: string;
  /** Whether the page is live right now (`published` and inside its publish window). */
  published: boolean;
  /** Content workflow status. */
  status: "draft" | "in_review" | "published" | "archived";
  visible: boolean;
  routable: boolean;
  isModule: boolean;
  order: number;
  depth: number;
  parentPath: string | null;
  taxonomy: Record<string, string[]>;
  /** URL path to the cover image, derived from `frontmatter.image`. */
  coverImage?: string;
}

// === Collections ===

/** Where a collection pulls its pages from. */
export type CollectionSource =
  | { "@self.children": true }
  | { "@self.siblings": true }
  | { "@self.modules": true }
  | { "@self.descendants": true }
  | { "@page.children": string }
  | { "@page.descendants": string }
  | { "@taxonomy.category": string | string[] }
  | { "@taxonomy.tag": string | string[] }
  | { "@taxonomy": Record<string, string | string[]> }
  | { "@flex": string }
  | { "@frontmatter": string };

/** Declarative collection definition (lives in page frontmatter). */
export interface CollectionDefinition {
  items: CollectionSource;
  order?: {
    by: "date" | "title" | "order" | "random" | string;
    dir?: "asc" | "desc";
  };
  filter?: {
    published?: boolean;
    visible?: boolean;
    routable?: boolean;
    template?: string | string[];
    taxonomy?: Record<string, string | string[]>;
  };
  limit?: number;
  offset?: number;
  pagination?: boolean | { size: number };
}

/** A resolved collection. */
export interface Collection {
  items: Page[];
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  /**
   * Pre-load all items. The routing layer calls this before rendering a
   * template; before it resolves, `items` is empty.
   */
  load(): Promise<Page[]>;
  order(by: string, dir?: "asc" | "desc"): Collection;
  filter(fn: (page: Page) => boolean): Collection;
  slice(start: number, end?: number): Collection;
  paginate(size: number, page?: number): Collection;
}

/** One available translation of a page. */
export interface PageTranslation {
  /** Language code, e.g. "en". */
  lang: string;
  /** Canonical route shared across languages, e.g. "/about/". */
  route: string;
  /** Root-relative URL for this language, e.g. "/de/about/". */
  url: string;
}

// === Configuration a template may rely on ===

/** The site settings a template may rely on. */
export interface SiteConfig {
  title: string;
  description: string;
  /** Public URL of the site, including any path prefix. */
  url: string;
  /**
   * Path prefix the site is served under when running behind multisite
   * `path_prefix` routing. Empty or undefined otherwise. Prepend `site.url`
   * rather than reading this directly.
   */
  basePath?: string;
}

/** The theme settings a template may rely on. */
export interface ThemeConfig {
  /** Active theme name. */
  name: string;
  /** Free-form settings from `theme.custom`. */
  custom: Record<string, unknown>;
}

/** The slice of the configuration a template receives as `props.config`. */
export interface TemplateConfig {
  site: SiteConfig;
  theme: ThemeConfig;
  system: {
    languages: {
      supported: string[];
      default: string;
      include_default_in_url: boolean;
      rtl_override?: string[];
    };
  };
}

// === Templates ===

/**
 * A resolved template component.
 *
 * The parameter is deliberately bivariant (method-style signature). Core's
 * props are a superset of these, so a function core hands out
 * (`page.component()`) requires more than this package declares, while a
 * template written against these props is accepted by core. A strict function
 * type would reject the first and gain nothing for the second.
 */
export type TemplateComponent = {
  bivarianceHack(props: TemplateProps): unknown;
}["bivarianceHack"];

/** One hit on the built-in `/search` page. */
export interface SearchResult {
  route: string;
  title: string;
  excerpt: string;
  score: number;
}

/** Props passed to theme templates (for .md/.mdx pages). */
export interface TemplateProps {
  page: Page;
  /** Pre-formatted page title: "Title - Descriptor | Site Name". */
  pageTitle: string;
  site: SiteConfig;
  config: TemplateConfig;
  /** Top-level navigation pages. */
  nav: PageIndex[];
  /**
   * Full site navigation for the page's language: every page, ordered, with
   * `depth`, `order` and `parentPath` for nested menus.
   */
  navAll?: PageIndex[];
  /**
   * Languages in which the current page exists, with the language-prefixed URL
   * for each. Includes the current page's own language. Empty on
   * single-language sites.
   */
  translations?: PageTranslation[];
  /** Text direction for the page's language. */
  dir: "ltr" | "rtl";
  /**
   * Theme UI-string translator. `t(key)` returns the key itself when missing
   * (an empty string in production); `t(key, fallback)` returns `fallback`.
   */
  t: (key: string, fallback?: string) => string;
  /** Current request pathname. */
  pathname?: string;
  /** Current request query string, e.g. "?submitted=1" (empty when none). */
  search?: string;
  /** Dynamically loaded layout component. */
  Layout?: TemplateComponent;
  collection?: Collection;
  /** Named collections resolved from the page's `collections:` frontmatter map. */
  collections?: Record<string, Collection>;
  /**
   * User-controlled theme settings from `data/theme-config.json`, populated
   * when the active theme declares a `config_schema` in `theme.yaml`.
   */
  themeConfig?: Record<string, unknown>;
  /** On the built-in `/search` page: the decoded query. */
  searchQuery?: string;
  /** On the built-in `/search` page: ranked results. */
  searchResults?: SearchResult[];
  children?: unknown;
}
