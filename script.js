// ================= DATA RENDERER =================
async function loadJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function renderProjects(projects, container, limit) {
  const items = limit ? projects.slice(0, limit) : projects;
  const prefix = container.dataset.prefix || "";
  container.innerHTML = items.map(p => `
    <li class="project-item">
      <div class="project-title">
        <a href="${prefix}${p.link}"${p.external ? ' target="_blank"' : ''}>${p.title}</a>
      </div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag${t === 'deprecated' ? ' tag-deprecated' : ''}">${t}</span>`).join('')}
      </div>
    </li>
  `).join('');
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

document.addEventListener("DOMContentLoaded", async () => {
  const projectList = document.getElementById("project-list");
  const blogList = document.getElementById("blog-list");
  const projectAllList = document.getElementById("project-list-all");
  const blogAllList = document.getElementById("blog-list-all");

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
