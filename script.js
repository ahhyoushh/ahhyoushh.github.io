async function loadJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function renderProjects(projects, container, limit) {
  const items = limit ? projects.filter(p => p.highlight).slice(0, limit) : projects;
  container.innerHTML = items.map(p => {
    const href = p.link;
    const external = href.startsWith("http");
    return `
    <li class="project-item">
      <div class="project-meta-row">
        <div class="project-title">
          <a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${p.title}</a>
        </div>
        ${p.date ? `<span class="project-date">${p.date}</span>` : ''}
      </div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag${t === 'deprecated' ? ' tag-deprecated' : ''}">${t}</span>`).join('')}
      </div>
    </li>
  `}).join('');
}

function renderBlogs(blogs, container, limit) {
  const items = limit ? blogs.slice(0, limit) : blogs;
  container.innerHTML = items.map(b => `
    <li class="blog-item">
      <div class="blog-meta-row">
        <div class="blog-title">
          <a href="${b.link}">${b.title}</a>
        </div>
        ${b.date ? `<span class="blog-date">${b.date}</span>` : ''}
      </div>
      <p class="blog-desc">${b.description}</p>
    </li>
  `).join('');
}

async function renderMarkdown(url, container) {
  const res = await fetch(url);
  let md = await res.text();
  md = md.replace(/^---[\s\S]*?---\s*/, "");

  const blocks = [];
  md = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => {
    const i = blocks.length;
    blocks.push(m.trim());
    return `<!--MB${i}-->`;
  });

  const inlines = [];
  md = md.replace(/\$([^\n$]+?)\$/g, (_, m) => {
    const i = inlines.length;
    inlines.push(m.trim());
    return `<!--MI${i}-->`;
  });

  let html = marked.parse(md);

  html = html.replace(/<!--MB(\d+)-->/g, (_, i) => {
    try { return katex.renderToString(blocks[+i], { displayMode: true, throwOnError: false }); }
    catch { return `<div class="math-block">${blocks[+i]}</div>`; }
  });

  html = html.replace(/<!--MI(\d+)-->/g, (_, i) => {
    try { return katex.renderToString(inlines[+i], { displayMode: false, throwOnError: false }); }
    catch { return `<span class="math-inline">${inlines[+i]}</span>`; }
  });

  container.innerHTML = html;

  if (window.hljs) {
    container.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const projectList = document.getElementById("project-list");
  const blogList = document.getElementById("blog-list");
  const projectAllList = document.getElementById("project-list-all");
  const blogAllList = document.getElementById("blog-list-all");
  const mdContainer = document.getElementById("md-content");

  if (projectList) {
    const data = await loadJSON("/projects.json");
    renderProjects(data, projectList, 5);
  }

  if (projectAllList) {
    const data = await loadJSON("/projects.json");
    renderProjects(data, projectAllList);
  }

  if (blogList) {
    const data = await loadJSON("/blogs.json");
    renderBlogs(data, blogList, 3);
  }

  if (blogAllList) {
    const data = await loadJSON("/blogs.json");
    renderBlogs(data, blogAllList);
  }

  if (mdContainer) {
    const mdUrl = mdContainer.dataset.md;
    if (mdUrl) renderMarkdown(mdUrl, mdContainer);
  }
});
