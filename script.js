// ================= DATA RENDERER =================
async function loadJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function renderProjects(projects, container, limit) {
  const items = limit ? projects.filter(p => p.highlight).slice(0, limit) : projects;
  const prefix = container.dataset.prefix || "";
  container.innerHTML = items.map(p => {
    const href = p.link.startsWith("http") ? p.link : prefix + p.link;
    const external = p.link.startsWith("http");
    return `
    <li class="project-item">
      <div class="project-title">
        <a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${p.title}</a>
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
  const prefix = container.dataset.prefix || "";
  container.innerHTML = items.map(b => `
    <li class="blog-item">
      <div class="blog-date">${b.date}</div>
      <div class="blog-title"><a href="${prefix}${b.link}">${b.title}</a></div>
      <p class="blog-desc">${b.description}</p>
    </li>
  `).join('');
}

// ================= MARKDOWN RENDERER =================

const inlineMathExtension = {
  name: 'inlineMath',
  level: 'inline',
  start(src) { return src.match(/\$/)?.index; },
  tokenizer(src) {
    const match = src.match(/^\$([^\n$]+?)\$/);
    if (match) return { type: 'inlineMath', raw: match[0], text: match[1].trim() };
  },
  renderer(token) {
    try {
      return `<span class="math-inline">${kern.renderToString(token.text)}</span>`;
    } catch {
      return `<span class="math-inline">${token.text}</span>`;
    }
  }
};

const blockMathExtension = {
  name: 'blockMath',
  level: 'block',
  start(src) { return src.match(/^\$\$/m)?.index; },
  tokenizer(src) {
    const match = src.match(/^\$\$([\s\S]*?)\$\$/);
    if (match) return { type: 'blockMath', raw: match[0], text: match[1].trim() };
  },
  renderer(token) {
    try {
      return `<div class="math-block">${kern.renderToString(token.text)}</div>`;
    } catch {
      return `<div class="math-block">${token.text}</div>`;
    }
  }
};

async function renderMarkdown(url, container) {
  const res = await fetch(url);
  let md = await res.text();
  md = md.replace(/^---[\s\S]*?---\s*/, "");
  const html = marked.parse(md, {
    extensions: [blockMathExtension, inlineMathExtension]
  });
  container.innerHTML = html;
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

  // ================= DEV MODE =================
  const toast = document.getElementById("dev-toast");
  if (!toast) return;

  let devMode = false;

  const showToast = (msg, duration = 2000) => {
    toast.querySelector("#dev-toast-text").textContent = msg;
    toast.style.opacity = 1;
    toast.style.pointerEvents = "auto";
    setTimeout(() => {
      toast.style.opacity = 0;
      toast.style.pointerEvents = "none";
    }, duration);
  };

  showToast("DEV MODE READY: ctrl+shift+D", 8000);

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "KeyD") {
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyD") {
      e.preventDefault();
      devMode = !devMode;
      if (devMode) {
        document.body.classList.add("dev-mode");
        showToast("DEV MODE: ON");
      } else {
        document.body.classList.remove("dev-mode");
        showToast("DEV MODE: OFF");
      }
    }
  });
});
