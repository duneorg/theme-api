# @dune/theme-api

The contract between [Dune CMS](https://getdune.org) and its themes: the types a
template is written against and the pure helpers it may call.

```tsx
import type { TemplateProps } from "@dune/theme-api";
import { formatDate, getSearchUrl, truncate } from "@dune/theme-api";

export default function Post({ page, t }: TemplateProps) {
  return <h1>{page.frontmatter.title}</h1>;
}
```

A leaf package: no dependency on `@dune/core` or `@dune/plugin-api`. Core
imports it and type-tests that what it hands a template is assignable to these
declarations. Themes should depend on this package, not on core.

Not published yet: born at 1.0.0 (no release candidate) together with Dune 0.36.
See `CHANGELOG.md`.
