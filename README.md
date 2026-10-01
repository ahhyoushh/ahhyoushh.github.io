# ayush.sh

Personal site — plain HTML and CSS, typeset with
[LaTeX.css](https://latex.vercel.app).

There is **no build step**. `site/` is the source of truth: open any file, edit
it, refresh. No npm, no framework, no `node_modules`.

## Running it

Because every link and asset is relative, any static server works:

```sh
python3 -m http.server 8000 --directory site
# then open http://localhost:8000
```

`file://` mostly works too, except that clicking a link to a folder
(`/projects/`) lands on a directory listing — open the `index.html` inside it.
Serving over HTTP avoids that.

To deploy, copy `site/` to any static host. GitHub Actions publishes `site/`
as a Pages artifact on every push to `main`.

## Layout

```
site/
├── index.html            # homepage: about me, projects, writeups
├── contact/index.html
├── projects/index.html
├── blogs/index.html      # all writeups
├── <slug>/index.html     # one top-level folder per writeup
├── styles/
│   ├── latex.css         # VENDORED LaTeX.css + this site's overrides
│   ├── katex.css         # VENDORED KaTeX
│   └── fonts/            # 20 woff2 (4 Latin Modern + 16 KaTeX)
├── scripts/
│   ├── theme.js          # theme toggle button
│   └── code-blocks.js    # code block bars (writeups only)
└── assets/               # images, og image, webring badge
```

Writeup folders sit at the top level, **not** under `blogs/` — so the canonical
URL for one is `/<slug>/` and the listing lives at `/blogs/`. Adding a page means
adding a folder with an `index.html` inside, then linking to it as
`../new-page/` from a sibling, or `./new-page/` from the homepage.

Every page carries the same chrome: one `<header class="site-header">` (site name
+ nav + theme toggle), one optional `<footer class="site-footer">`, and exactly
one `.back-link` if it is not the homepage. The webring appears on the homepage
only.

## Design

The design follows [0xmukesh.github.io](https://0xmukesh.github.io) — the same
LaTeX.css base with a much smaller site layer.

- The measure is **700px**. LaTeX.css defaults to `80ch`, which is ~600px in
  Latin Modern and reads cramped.
- **Only the identity block is centred** — the site name and the nav line. Page
  titles are centred too, because LaTeX.css centres `h1:first-child` natively
  and they are titles, not prose. Everything else — about copy, entry
  descriptions, post bodies, contact rows — is left-aligned.
- **Sections are divided by a 1px rule under the heading** (`.section > h2`,
  `.post-body h2`, `h1.page-title`), not by blank space alone, so the
  separation survives on a narrow screen.
- The nav pipes are generated in CSS with `li + li::before`, so the nav stays a
  plain list of links with no decorative list items in the markup.
- Homepage listings use **whitespace, not rules**, between rows. The full
  `/projects` and `/blogs` listings keep their rules — those are long lists
  where a divider genuinely helps.
- Every page has exactly one `<h1>`.
- `.site-name` sets its own `font-weight: 700`, because the homepage renders the
  name as an `<h1>` (it is that page's title) while every other page renders it as
  a `<p><a>` link home. Without the explicit weight the two render at different
  boldness.
- Exactly one theme toggle per page, in the site header.

## Editing a writeup

Writeups are plain HTML in `site/<slug>/index.html`. The body is inside
`<div class="post-body">`.

### Headings

```html
<h2 id="section">Section</h2>
<h3 id="subsection">Subsection</h3>
```

`h2` gets the section rule. Give headings an `id` so they can be linked to.

### Text, links and lists

```html
<p><strong>bold</strong>, <em>italic</em>, <code>inline code</code></p>
<p><a href="https://example.com">a link</a></p>

<ul><li>item</li><li>item<ul><li>nested</li></ul></li></ul>
<ol><li>item</li></ol>
```

Internal links are relative: from a writeup, `../projects/`; from the homepage,
`./projects/`.

### Images

```html
<img src="../assets/my-image.png" alt="alt text" loading="lazy" decoding="async" />
<p><em>Fig 1. Caption text</em></p>
```

Paths are relative to the page, and depth-dependent — from
`site/betjee/index.html` the `../` prefix is required. An `<em>` line
directly below an `<img>` renders as a centred caption.

### Code blocks

Shiki markup is already baked in. A highlighted block looks like this:

```html
<pre class="shiki-code shiki-code-themes github-light github-dark"
     style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e; overflow-x: auto;"
     tabindex="0" data-language="js"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span> x = 1;</span>
<span class="line">...</span></code></pre>
```

Three things must survive:

- `class="shiki-code shiki-code-themes github-light github-dark"` — the theme
  names select the custom properties the CSS reads
- `--shiki-light` / `--shiki-dark` on the `pre` **and on every inner `span`**
- `data-language` — the code bar reads this to label the block

`scripts/code-blocks.js`, loaded by every writeup, wraps each `pre` in a
`.code-block` with a slim bar carrying the language plus **hide/show** and
**copy** controls. It keys off `pre.shiki-code`, so that class is required for
the controls to appear.

To generate fresh highlighted markup, paste a snippet into
[shiki.io](https://shiki.io) with the `github-light` and `github-dark` themes
and drop the output in.

#### Collapsed blocks

To ship a block collapsed, put a marker on the **first line** — `//`, `#`, `--`
or `<!--` all work:

```html
<pre class="shiki-code shiki-code-themes github-light github-dark"
     data-language="js"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#8B949E">// @collapsed</span></span>
<span class="line">function longSetup() {}</span></code></pre>
```

The script deletes that first `line` node and hides the rest. Highlighting is
unaffected, because the marker lives in its own `line` span.

### Math

KaTeX markup is baked in — `<span class="katex">…</span>` with its
`.katex-mathml` accessibility layer and `.katex-html` visual layer. To render
new math, use a local KaTeX install or an online tool and paste the result.
`katex.css` and its 20 fonts are already linked on every page.

### Tables, quotes, callouts

```html
<table>
  <thead><tr><th>Header</th></tr></thead>
  <tbody><tr><td>Cell</td></tr></tbody>
</table>

<blockquote><p>A quote.</p></blockquote>
<hr />

<div class="note">
  <p><strong>Note:</strong> A left-ruled aside.</p>
</div>
```

Tables scroll horizontally on narrow viewports.

## Theme

Dark mode is LaTeX.css's own mechanism — a class on `<html>`:

There are exactly two states, and dark is the default:

| Class        | Result               |
|--------------|----------------------|
| `latex-dark` | dark (the default)   |
| `latex-light`| light, when chosen   |

A tiny inline script in `<head>` reads `localStorage.theme` and resolves the
class before first paint, so there is no flash and no dependence on the OS
setting. `scripts/theme.js` handles the button — one underlined word in the nav —
and keeps `theme-color` (the mobile browser-chrome colour) in sync.

Contrast against the `#0a0a0a` background, all measured:

| Token            | Dark             | Ratio  | Light            | Ratio  |
|------------------|------------------|--------|------------------|--------|
| `--body-color`   | `#D9D9D6`        | 14.00  | `#17171A`        | 17.13  |
| `--muted`        | `#9A9A96`        | 7.01   | `#5A5A5F`        | 6.57   |
| `--link`         | `#7CB7F0`        | 9.32   | `#175E8C`        | 6.67   |
| `--link-visited` | `#7CB7F0`        | 9.32   | `#6B4E9B`        | 6.31   |
| `--rule`         | `#2E2E2C`        | 1.46 * | `#D4D4D4`        | 1.42 * |
| `--rule-strong`  | `#464644`        | 2.09 * | `#A8A8A2`        | 2.29 * |

`*` hairlines and block surfaces are not text, so they sit below the 4.5:1 text
threshold by design — the point is that `--rule` is now *visible* as a divider.
The previous dark `--rule` was `#1C1C1C` at **1.16:1**, effectively invisible.

`--muted` carries most of the secondary text on the site (entry descriptions,
post meta, footers, blockquotes), so it is held to the 7:1 range rather than the
5.5:1 it used to sit at.

Because Shiki emits both palettes as custom properties, `latex.css` picks one:

```css
.shiki-code { color: var(--shiki-dark); }        /* :root is dark */
.latex-light .shiki-code { color: var(--shiki-light); }
```

## Vendored dependencies

Both stylesheets and their fonts live in the repo, so the site makes **zero**
requests to a CDN. The only external request is GoatCounter analytics.

| File                 | Upstream                                | Local changes                                                     |
|----------------------|-----------------------------------------|-------------------------------------------------------------------|
| `styles/latex.css` | `https://latex.vercel.app/style.css` (MIT) | Libertinus faces dropped (never used); `src:` trimmed to woff2; site overrides appended under a `SITE LAYER` banner |
| `styles/katex.css` | KaTeX 0.16.11 (MIT)                  | `src:` lists trimmed to woff2                                       |
| `styles/fonts/`    | the 4 + 16 woff2 files they reference | committed to the repo                                                |

**To update LaTeX.css**: download `https://latex.vercel.app/style.css`, replace
everything from the first `@font-face` down to the `SITE LAYER` banner in
`site/styles/latex.css`, and re-append the site layer from the bottom. See the
vendoring banner at the top of that file.

## Shared scripts

There is no framework, so behaviour that more than one page needs lives in
`site/scripts/` rather than being inlined into every page:

| Script            | Loaded by     | Does                                       |
|-------------------|---------------|--------------------------------------------|
| `theme.js`        | every page    | wires the one `[data-theme-toggle]` button |
| `code-blocks.js`  | writeups only | adds language / hide-show / copy to `pre`  |

Both are loaded with `defer`. Each is safe to load on a page that has nothing to
act on. The pre-paint theme script stays inline in each `<head>` because it has
to run before the body is parsed — that is the one piece of behaviour that cannot
be deferred.

## Deploy

Push to `main`. GitHub Actions uploads `site/` as a Pages artifact and publishes
it — no build step runs, and no `gh-pages` branch is involved. Set **Source** to
**GitHub Actions** in the repo's Pages settings once.

The site is served at `https://ahhyoushh.github.io`.