# C++ Alliance Website

Source code for [cppalliance.org](https://cppalliance.org), The C++ Alliance’s public-facing site. It is a classic Jekyll 3.8 project that publishes a fully static site through GitHub Pages.

## Typical Workflow

```bash
bundle install
bundle exec jekyll serve --livereload
```

1. Install Ruby dependencies via Bundler.
2. Iterate locally with `bundle exec jekyll serve --livereload`; it compiles Sass, renders Markdown/HTML, and writes to `_site/`.
3. Edit content in `_posts/`, `people/`, and page files; adjust styling inside `_sass`; place supporting media in the relevant asset directories.
4. Commit only source files. `_site/` is build output and should remain untracked.

## Authoring Blog Posts

1. Name files `YYYY-MM-DD-title.md` and place them in `_posts/`.
2. Use front matter similar to (or use other posts as templates):
   ```yaml
   ---
   layout: post
   nav-class: dark
   categories: company, vinnie   # include the author’s id
   title: Something Worth Reading
   author-id: vinnie              # maps to people/vinnie.html
   hero-image: 2024-01-01-title.png   # optional; stored under images/posts/
   large-image: /images/social-card.png # optional Twitter card override
   summary: Optional 160-character blurb for social cards
   ---
   ```
3. Provide `author-name` if there is no matching `people/<id>.html`. Otherwise the layout resolves the display name automatically.
4. Store hero images under `images/posts/`; they appear in both the post header and the News index when present.
5. `_layouts/post.html` compares the full `categories` array when building the “All posts by this author” list. Keep author ids consistent and avoid shuffling them between posts, or the archive may appear empty.
6. When a post has many sections, drop `{% include post-toc.md title="Contents" %}` just below the intro. The include emits Kramdown’s `{:toc}` macro so the list stays synchronized with every heading automatically; omit the `title` param to fall back to “Table of Contents.”
7. Write the body in Markdown/HTML, preview with `bundle exec jekyll serve --livereload`, and confirm the post surfaces on `/news` and the author’s bio page. The legacy [wiki guide](https://github.com/cppalliance/cppalliance.github.io/wiki/Posting-a-Blog) still applies, but this README is the canonical reference.

## Architecture

- `_config.yml` defines site metadata (title, description, contact email, social handles), Markdown settings (Kramdown + GFM), pagination defaults, Atom feed limits, Twitter card fallback, and plugin configuration (`jekyll-feed`, `jekyll-sitemap`, `jekyll-email-protect`, `jekyll-seo-tag`, `jekyll-paginate`).
- `Gemfile` pins Jekyll `~> 3.8.3`, Minima `~> 2.0`, and the plugin bundle. Always run commands via `bundle exec` so these locked versions are honored.
- `_layouts/default.html` supplies the HTML skeleton: Google Fonts, compiled CSS, SEO tags, navigation, footer, analytics (Plausible + Google Analytics), Atom feed discovery, and conditional Prism assets for posts.
- `_site/` contains the generated output—never hand-edit it. `CNAME` keeps the Pages deployment bound to `cppalliance.org`.
- `Project Operation Guide.adoc` documents high-level operational practices (onboarding, hiring models) and should be updated alongside code conventions when relevant.

## Content Model

- `index.html` composes Mission, Activities, Sponsors, Team, FAQ, News, and Contact sections. The IDs exposed there (`#mission`, `#team`, etc.) must stay aligned with the nav links inside `_layouts/default.html`.
- Long-form subpages include `news/index.html` (paginate `_posts` with optional hero art), `slack/index.html` (community FAQ + acceptable-use policy), and `proposals.html` (funding-request guidance).
- `_posts/*.md` house dated blog/news entries with `layout: post`. Each post must include the author’s id in `categories` so it flows into team pages.
- `people/*.html` define team bios via front matter (`member-name`, `position`, `id`, contact links). Portraits live at `images/people/<id>.jpg` and are consumed by the `team` layout.
- Static assets such as PDFs, videos, SVG illustrations, and hero artwork sit directly under `/pdf`, `/videos`, `/images`, etc., and are linked from the relevant pages.

## Layouts & Includes

- `_layouts/post.html` renders individual posts, handles hero images, resolves `author-id` into a display name, loads Prism assets, and generates an “All posts by this author” list.
- `_layouts/team.html` renders member pages with the photo, title, social icon bar (`_includes/team-bio.html`), bio body, and the `_includes/team-blog.html` feed filtered by `site.categories[page.id]`.
- `_includes/top-title.html` supplies the home hero; `contact.html` renders the “Connect” social grid; `favicon.html` injects favicon link tags; `paginator.html` drives numbered pagination; `team-bio.html` outputs gold icons for each contact field.

## Default Layout Behavior

- `page.nav-class` toggles nav styling (`transparent` for the homepage hero, `dark` elsewhere). Always set it on new pages.
- Social metadata falls back to `site.title_image`. Posts can override via `page.image` or `page.large-image`, and supplying `page.summary` tightens the Twitter description.
- Nav links are hardcoded to the homepage anchors plus a few static pages. Keep section IDs and link targets synchronized to avoid dead anchors, especially on mobile.
- Plausible and Google Analytics scripts live exclusively in the default layout; no other template should add tracking snippets.
- Prism CSS/JS only load when `page.layout == 'post'`. Reuse that layout (or the same condition) for any new syntax-highlighted content.

## Styling

- `css/style.scss` is the sole Sass entry point compiled by Jekyll into `css/style.css`. It imports partials in this order:
  - `_sass/base`: reset, tokens (`config.scss`), helper functions, typography, print styles.
  - `_sass/modules`: reusable components (cards, hero, navigation, layout grid, news list, Slack page, footer, social icons).
  - `_sass/pages`: page-specific layers (`homepage.scss`, `post.scss`, `team.scss`). `post_backup.scss` is retained for reference but not imported.
- `css/prism.css` styles syntax-highlighted blocks inside posts and is only loaded when the layout requests it.

## Scripts & Interactivity

- `js/main.js` powers the responsive nav drawer: toggles the hamburger, locks body scroll when the menu is open, closes the drawer on resize, and auto-hides after tapping any `.nav-link-mobile` below 1024px width.
- `js/prism.js` is a vendored PrismJS 1.20.0 build with C/C++ grammars and the `line-numbers`, `toolbar`, and `copy-to-clipboard` plugins. The default layout loads it for post pages only.

## Key Pages & Sections

- `news/index.html` uses `paginator.posts` (5 per page by default) and falls back to `site.posts` if pagination is disabled. Snippets come from `post.content | strip_html | truncate: 500`.
- `slack/index.html` is the authoritative source for invite links, FAQs, acceptable-use policy, and resource links. Its markup ties directly into `_sass/modules/slack.scss`.
- `proposals.html` describes the criteria for funding proposals and emails `louis@cppalliance.org` (encoded via `| encode_email`).
- `people/*.html` rely on `page.id` matching the filename and portrait asset. The same id doubles as the key in `site.categories`.
- `index.html` hardcodes the team card grid, pulls in the hero include, and reuses `contact.html`. Updating the team requires changes here plus the corresponding `people/*.html` entries and portrait assets.

## Assets

- Static media lives directly under `/images`, `/videos`, `/fonts`, `/pdf`, and `/news`. Social icons live in `images/icons/*.svg` and are referenced in both the nav and contact sections.
- Blog hero art should live in `images/posts/`. People portraits must sit under `images/people/` using the person’s `id`.
- Favicons (`favicon-*.png`, `safari-pinned-tab.svg`, `android-chrome-*.png`, etc.) and `CNAME` support the custom domain—update only when branding changes.

## Maintenance Notes & Gotchas

- Keep navigation anchor IDs synchronized with the hardcoded links in `_layouts/default.html`. If you rename `#mission`, update both the section ID and every nav link pointing to it.
- `_includes/team-blog.html` expects `site.categories[page.id]` to exist. If a member page renders no posts, double-check the spelling of the author id in every post’s `categories`.
- `_includes/paginator.html` references `site.data.ui-text[site.locale]` for labeling. Leaving these values unset falls back to “Previous/Next,” so only touch them if localization is intentional.
- Encode email addresses with `| encode_email` for consistency (`contact.html`, `proposals.html`, people pages).
- When creating new highlighted pages, either reuse `layout: post` or replicate its Prism loading behavior.
- Never modify files under `_site/`; rebuild instead.
