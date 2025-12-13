// ================= CONFIG =================
const SUPABASE_URL = "https://dojaqvnqlaazhnnpgwrf.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_9xzQLpvq07XjXznVxVl-2w_ORpZkRZA";

const projectHasTodos = new Set();

// ================= HELPERS =================
function getProjects() {
  return document.querySelectorAll(".project-item[data-project-id]");
}

function findProjectById(id) {
  const projects = getProjects();
  for (const p of projects) {
    if (p.dataset.projectId.toLowerCase() === id) return p;
  }
  return null;
}

// ================= FETCH =================
async function fetchTodos() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/todos?select=id,title,sub_tasks,project_id,is_done`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  return res.json();
}

// ================= MAIN =================
async function initIdeas() {
  const todoList = document.getElementById("todo-list");
  if (!todoList) return;

  const todos = await fetchTodos();

  const existing = {};
  const upcoming = {};
  const other = [];

  // ---- classify todos ----
  todos.forEach(todo => {
    if (todo.project_id) {
      projectHasTodos.add(todo.project_id.toLowerCase());
    }

    if (!todo.project_id) {
      other.push(todo);
      return;
    }

    const pid = todo.project_id.toLowerCase();
    const project = findProjectById(pid);

    if (project) {
      if (!existing[pid]) existing[pid] = [];
      existing[pid].push(todo);
    } else {
      if (!upcoming[pid]) upcoming[pid] = [];
      upcoming[pid].push(todo);
    }
  });

  // ---- render helper ----
  const renderTodos = todos => {
    const pending = todos.filter(t => !t.is_done);
    const done = todos.filter(t => t.is_done);

    [...pending, ...done].forEach(todo => {
      const li = document.createElement("li");
      li.className = "todo-item";
      if (todo.is_done) li.classList.add("todo-done");

      const title = document.createElement("div");
      title.className = "todo-title";
      title.textContent = todo.title;
      li.appendChild(title);

      if (Array.isArray(todo.sub_tasks) && todo.sub_tasks.length) {
        const ul = document.createElement("ul");
        ul.className = "subtask-list";

        todo.sub_tasks.forEach(st => {
          const si = document.createElement("li");
          si.className = "subtask-item";
          si.textContent = st;
          ul.appendChild(si);
        });

        li.appendChild(ul);
      }

      todoList.appendChild(li);
    });
  };

  // ===== Existing projects =====
  Object.entries(existing).forEach(([pid, items]) => {
    const project = findProjectById(pid);
    const name =
      project?.querySelector(".project-title")?.innerText || pid;

    const header = document.createElement("li");
    header.className = "todo-project-header";

    const link = document.createElement("a");
    link.textContent = name;
    link.href = "#projects";
    link.className = "todo-project-link";

    header.appendChild(link);
    todoList.appendChild(header);

    renderTodos(items);
  });

  // ===== Upcoming projects =====
  if (Object.keys(upcoming).length) {
    const up = document.createElement("li");
    up.className = "todo-section-header";
    up.textContent = "UPCOMING PROJECTS";
    todoList.appendChild(up);

    Object.entries(upcoming).forEach(([pid, items]) => {
      const header = document.createElement("li");
      header.className = "todo-project-header upcoming";

      const link = document.createElement("a");
      link.textContent = pid;
      link.href = "#ideas";
      link.className = "todo-project-link";

      header.appendChild(link);
      todoList.appendChild(header);

      renderTodos(items);
    });
  }

  // ===== Other tasks =====
  if (other.length) {
    const ot = document.createElement("li");
    ot.className = "todo-section-header";
    ot.textContent = "OTHER TASKS";
    todoList.appendChild(ot);

    renderTodos(other);
  }

  // ===== Inject "tasks" link into Projects section =====
  projectHasTodos.forEach(pid => {
    const project = findProjectById(pid);
    if (!project) return;

    if (project.querySelector(".project-todo-link")) return;

    const link = document.createElement("a");
    link.textContent = "tasks";
    link.href = "#ideas";
    link.className = "project-todo-link";

    const tags = project.querySelector(".project-tags");
    if (!tags) return;

    if (project.querySelector(".project-todo-link")) return;

    tags.insertAdjacentElement("afterend", link);

  });
}

// ================= RUN =================
document.addEventListener("DOMContentLoaded", initIdeas);
