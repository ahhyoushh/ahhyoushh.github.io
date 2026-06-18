# ayush.sh

Personal site — blogs and projects written in Markdown with KaTeX math rendering.

## Structure

```
/
├── blogs.json             # Blog listing data
├── projects.json          # Project listing data
├── script.js              # Fetch JSON → render HTML lists; fetch .md → render with marked + KaTeX
├── style.css              # All styles including .md-content for rendered markdown
│
├── blogs/                 # Blog markdown source + shell pages
│   ├── index.html         # Listing page (reads blogs.json)
│   ├── betjee.md          # Markdown source
│   ├── betjee/index.html  # Shell: <section data-md="../betjee.md">
│   ├── betjee_v2.md
│   ├── betjee_v2/index.html
│   ├── DiwaliAQI.md
│   └── DiwaliAQI/index.html
│
├── projects/              # Same pattern as blogs/
│   ├── index.html
│   └── ...
│
└── index.html             # Homepage with featured (limited) lists
```

## Adding a blog post

1. Create `blogs/your-post.md` with optional frontmatter (auto-stripped)
2. Create `blogs/your-post/index.html` — use the shell template below
3. Add entry to `blogs.json`

## Adding a project

Same flow as blog, but files go in `projects/`.

## Shell page template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>title — ayush bhalerao</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" type="image/png" href="/assets/favicon.png" />
</head>
<body>
  <nav>
    <div class="nav-brand"><a href="/">$ ayush</a></div>
    <ul class="nav-links">
      <li><a href="/#about">about</a></li>
      <li><a href="/projects">projects</a></li>
      <li><a href="/blogs">blogs</a></li>
    </ul>
    <div class="nav-social">
      <a href="https://github.com/ahhyoushh" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
      <a href="https://linkedin.com/in/ayushbhalerao" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
      <a href="mailto:iush.wrk@gmail.com" title="Email"><i class="fas fa-envelope"></i></a>
    </div>
  </nav>

  <section class="md-content" id="md-content" data-md="../your-post.md"></section>
 
  <footer>
    <p class="footer-text">© 2026 ayush bhalerao</p>
  </footer>
 
  <script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="/script.js"></script>
</body>
</html>
```

Key parts:
- `<section id="md-content" data-md="../your-post.md">` — `script.js` fetches this path and renders it
- `data-md` path is relative to the shell page: `../post.md` from `posts/post/index.html`
- External script/style tags: `marked.min.js`, `katex.min.js`, Highlight.js (CSS and JS), then `/script.js`
- `/style.css` and `/script.js` use absolute paths (from root) to work from any nested directory

## Math rendering

LaTeX math via [KaTeX](https://katex.org/):

| Delimiter   | Type   |
|-------------|--------|
| `$...$`     | inline |
| `$$...$$`   | block  |

### LaTeX quick reference

| Expression               | LaTeX                        |
|--------------------------|------------------------------|
| superscript              | `x^2`                        |
| subscript                | `x_i`                        |
| fraction                 | `\frac{a}{b}`                |
| sum                      | `\sum_{i=1}^n`               |
| integral                 | `\int_a^b`                   |
| square root              | `\sqrt{x}`                   |
| nth root                 | `\sqrt[n]{x}`                |
| Greek letters            | `\alpha, \beta, \pi`         |
| parentheses (auto-size)  | `\left( ... \right)`         |
| matrix                   | `\begin{matrix} ... \end{matrix}` |
| cases                    | `\begin{cases} ... \end{cases}` |
| arrow                    | `\to, \rightarrow, \implies` |
| set notation             | `\in, \subset, \cup, \cap`   |
| relational               | `\leq, \geq, \approx, \neq`  |
| ellipsis                 | `\dots`                      |
| text in math             | `\text{some words}`          |

Inline example: `$E = mc^2$` renders as $E = mc^2$.

Block example:
```latex
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

Renders as:
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

### Writing blog content with LaTeX

Wrap inline math in single `$...$` and display math in `$$...$$`:

```markdown
The quadratic formula $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ solves $ax^2 + bx + c = 0$.

For sums:
$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$
```

## Markdown & Code Blogging Guide

Here is a quick reference for general markdown syntax supported by `marked`:

### Text Formatting
- **Bold**: `**text**` or `__text__`
- *Italics*: `*text*` or `_text_`
- ~~Strikethrough~~: `~~text~~`

### Lists
- Unordered list:
  ```markdown
  - Item 1
  - Item 2
    - Nested Item
  ```
- Ordered list:
  ```markdown
  1. First item
  2. Second item
  ```

### Code Blocks
To write multi-line code blocks with syntax highlighting:
````markdown
```js
const x = 10;
console.log(x);
```
````

To write inline code, wrap the text in a single backtick: `` `const x = 10` ``.

### Quotes & Callouts
To add a blockquote:
```markdown
> This is a blockquote.
```

To create a highlighted note (styled via style.css):
```markdown
<div class="note">

**Note:** This is a styled note/callout block.

</div>
```

### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Links and Images
- Link: `[Google](https://google.com)`
- Image: `![Alt Text](/assets/image.png)`
- Caption: Add a paragraph with italics directly below the image: `*Fig 1. Image Caption.*`


## JSON format

### blogs.json

```json
{
  "title": "post title",
  "description": "short summary",
  "link": "/blogs/your-post",
  "date": "jan 2026"
}
```

### projects.json

```json
{
  "title": "project name",
  "description": "short summary",
  "link": "/projects/your-project",
  "tags": ["tag1", "tag2"]
}
```

For external links, the link field should start with `http`.

## CDN dependencies

- [marked](https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js) — Markdown → HTML
- [KaTeX](https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js) — LaTeX math renderer
- [KaTeX CSS](https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css) — math font & layout
- [Highlight.js](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js) — Syntax highlighting for code blocks
- [Highlight.js CSS](https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css) — theme for code blocks
- [Font Awesome](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css) — icons
- [Google Fonts](https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700) — Fira Code + Inter

