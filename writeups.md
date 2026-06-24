# ayush.sh

Personal site — built with [Astro](https://astro.build).

## Tech stack

- **Astro** — static site generation, file-based routing, content collections
- **KaTeX** — LaTeX math rendering via `remark-math` + `rehype-katex`
- **Shiki** — syntax highlighting (theme: `github-dark`)
- **Font Awesome 6.5.0** — icons
- **GoatCounter** — analytics

## Adding a blog post

1. Create a `.md` file in `src/content/blogs/` (e.g. `my-post.md`)
2. Add the required frontmatter:

```yaml
---
title: "my post title"
description: "short summary shown on listing pages"
link: "/blogs/my-post"
date: "jan 2026"
---
```

3. Write your content in markdown below the frontmatter
4. The post automatically appears on `/blogs` and the homepage (top 3 by date)
5. The slug is the filename (without `.md`), e.g. `my-post.md` → `/blogs/my-post`

## Adding a project

1. Create a `.md` file in `src/content/projects/` (e.g. `my-project.md`)
2. Add the required frontmatter:

```yaml
---
title: "my project"
description: "short description (can include HTML like <a> tags)"
link: "https://github.com/..."
highlight: true
date: "jan 2026"
tags:
  - tag1
  - tag2
---
```

3. The project automatically appears on `/projects` and the homepage (top 5 highlighted by date)
4. Set `highlight: true` for it to appear on the homepage
5. For internal links, set `link` to a path like `/my-path`; for external links, start with `http`

## Markdown guide

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text formatting

```markdown
**bold text**
*italic text*
~~strikethrough~~
```

### Links

```markdown
[link text](https://example.com)
```

### Images

```markdown
![alt text](/assets/my-image.png)
```

Images span full width and get rounded corners. Add a caption with an italic line directly below:

```markdown
![Diagram](/assets/diagram.png)
*Fig 1. Caption text*
```

### Lists

```markdown
- unordered item
- another item
  - nested item

1. ordered item
2. another item
```

### Code blocks

````markdown
```python
def hello():
    print("hello world")
```
````

Language is automatically detected and syntax-highlighted. A copy button appears on hover.

Inline code: `` `const x = 1` ``

### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Blockquotes

```markdown
> This is a quote.
```

### Horizontal rule

```markdown
---
```

## LaTeX math

Math is rendered via KaTeX. Delimiters:

| Delimiter | Type |
|-----------|------|
| `$...$` | inline |
| `$$...$$` | block |

### Inline math

```markdown
The formula $E = mc^2$ is famous.
```

### Block math

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

### Common LaTeX reference

| Expression        | LaTeX                         |
|-------------------|-------------------------------|
| superscript       | `x^2`                         |
| subscript         | `x_i`                         |
| fraction          | `\frac{a}{b}`                 |
| sum               | `\sum_{i=1}^n`                |
| integral          | `\int_a^b`                    |
| square root       | `\sqrt{x}`                    |
| nth root          | `\sqrt[n]{x}`                 |
| Greek letters     | `\alpha, \beta, \pi`          |
| parentheses (auto)| `\left( ... \right)`          |
| matrix            | `\begin{matrix} ... \end{matrix}` |
| cases             | `\begin{cases} ... \end{cases}`   |
| arrow             | `\to, \rightarrow, \implies`   |
| set notation      | `\in, \subset, \cup, \cap`     |
| relational        | `\leq, \geq, \approx, \neq`    |
| ellipsis          | `\dots`                        |
| text in math      | `\text{some words}`            |
| calligraphic      | `\mathcal{L}`                  |
| bold math         | `\mathbf{x}`                   |

## Notes / callouts

Use a `<div class="note">` block:

```markdown
<div class="note">

**Note:** This is a styled callout box.

</div>
```

## Folder structure

```
src/
├── content/
│   ├── config.ts           # Zod schemas for projects & blogs
│   ├── projects/*.md       # Project entries (frontmatter + optional body)
│   └── blogs/*.md          # Blog posts (frontmatter + markdown body)
├── layouts/
│   ├── Base.astro          # Head, nav, footer, slot, goatcounter, copy btn
│   └── BlogPost.astro      # Extends Base with md-content wrapper + back nav
├── pages/
│   ├── index.astro         # Homepage (hero, stats, about, projects, blogs, webring)
│   ├── projects/index.astro  # All projects listing
│   ├── blogs/index.astro     # All blogs listing
│   └── blogs/[slug].astro    # Dynamic blog post pages
├── styles/
│   └── global.css          # All styles
└── env.d.ts
public/
├── assets/                 # Static assets (favicon, images)
├── .nojekyll
└── ...
astro.config.mjs
package.json
tsconfig.json
.github/workflows/deploy.yml
```

## Local dev

```sh
npm install
npm run dev        # starts dev server at localhost:4321
npm run build      # builds to dist/
npm run preview    # preview the build locally
```

## Deploy

Push to `main` — GitHub Actions builds and deploys `dist/` to the `gh-pages` branch.

The site is served at `https://ahhyoushh.github.io`.
