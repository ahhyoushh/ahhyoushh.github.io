# ayush.sh

Personal site — blogs and projects written in Markdown with Typst math rendering.

## Structure

```
/
├── blogs.json             # Blog listing data → fed into /blogs/
├── projects.json          # Project listing data → fed into /projects/
├── script.js              # Fetch JSON → render HTML lists; fetch .md → render with marked + kern
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
│   ├── aqi.md
│   ├── aqi/index.html
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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kern-typ@0.1.1/styles/kern.css" />
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
  <script src="https://cdn.jsdelivr.net/npm/kern-typ@0.1.1/dist/kern.min.js"></script>
  <script src="/script.js"></script>
</body>
</html>
```

Key parts:
- `<section id="md-content" data-md="../your-post.md">` — `script.js` fetches this path and renders it
- `data-md` path is relative to the shell page: `../post.md` from `posts/post/index.html`
- Three script tags: `marked.min.js`, `kern.min.js`, then `/script.js`
- `/style.css` and `/script.js` use absolute paths (from root) to work from any nested directory

## Math rendering

Typst math via [kern](https://github.com/ThatOneCalculator/kern-typ):

| Delimiter        | Type   |
|------------------|--------|
| `$...$`          | inline |
| `$$...$$`        | block  |

See [typst.md](typst.md) for syntax reference.

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

For external links, add `"external": true` (adds `target="_blank"`).

## CDN dependencies

- [marked](https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js) — Markdown → HTML
- [kern](https://cdn.jsdelivr.net/npm/kern-typ@0.1.1/dist/kern.min.js) — Typst math renderer (client-side WASM)
- [kern CSS](https://cdn.jsdelivr.net/npm/kern-typ@0.1.1/styles/kern.css) — math font & layout
- [Font Awesome](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css) — icons
- [Google Fonts](https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700) — Fira Code + Inter
