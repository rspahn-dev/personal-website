const STORAGE_KEY = "site-data";

const DEFAULT_STATE = {
  about:
    "I’m Robin, a queer AI developer blending code, care, and community. This space collects my favorite projects and the stories behind them.",
  portfolioIntro:
    "Here are a few collaborative experiments and commissions. Each tile can host a demo, video, or screenshot as projects evolve.",
  contact: {
    email: "hello@example.com",
    instagram: "https://instagram.com/yourhandle",
    facebook: "https://facebook.com/yourprofile",
    linkedin: "https://linkedin.com/in/yourprofile"
  },
  projects: [
    {
      id: "project-1",
      title: "Community Signal Boost",
      description:
        "A platform that curates mutual aid requests and amplifies them across neighborhood networks in real time.",
      media: {
        src: "work1.png",
        alt: "Screenshot from Community Signal Boost"
      }
    },
    {
      id: "project-2",
      title: "XR Storytelling Lab",
      description:
        "Immersive storytelling experiments blending motion capture, AI generated scenery, and collaborative workshops.",
      media: null
    }
  ],
  posts: [
    {
      id: "post-1",
      title: "Designing for Joyful Mutual Aid",
      body: "Exploring how community-driven design keeps digital mutual aid spaces welcoming and sustainable.",
      image: {
        src: "website_banner.png",
        alt: "Abstract rainbow banner"
      },
      tags: ["community", "design"],
      published: "2024-05-12"
    },
    {
      id: "post-2",
      title: "Teaching Machines to Listen",
      body: "Notes from a workshop on building empathetic AI assistants alongside grassroots organizers.",
      image: null,
      tags: ["ai", "workshop"],
      published: "2024-03-18"
    }
  ]
};

const CONTACT_ICONS = {
  email: "📧",
  instagram: "📸",
  facebook: "📘",
  linkedin: "💼"
};

const hasWindow = typeof window !== "undefined";

function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function supportsLocalStorage() {
  if (!hasWindow) return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn("Local storage is unavailable; changes will reset on refresh.");
    return false;
  }
}

const canUseStorage = supportsLocalStorage();

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

function normalizeContact(contact = {}) {
  const base = { ...DEFAULT_STATE.contact };
  for (const key of Object.keys(base)) {
    const value = typeof contact[key] === "string" ? contact[key].trim() : "";
    if (value) {
      base[key] = value;
    }
  }
  return base;
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return deepClone(DEFAULT_STATE.projects);
  return projects
    .map((project, index) => {
      if (!project || typeof project !== "object") return null;
      const title = typeof project.title === "string" ? project.title.trim() : "";
      const description = typeof project.description === "string" ? project.description.trim() : "";
      if (!title || !description) return null;
      const normalized = {
        id: typeof project.id === "string" && project.id.trim() ? project.id.trim() : `project-${index + 1}`,
        title,
        description
      };
      if (project.media && typeof project.media === "object" && typeof project.media.src === "string") {
        const src = project.media.src.trim();
        if (src) {
          normalized.media = {
            src,
            alt:
              typeof project.media.alt === "string" && project.media.alt.trim() ? project.media.alt.trim() : `${title} preview`
          };
        }
      }
      return normalized;
    })
    .filter(Boolean);
}

function normalizePosts(posts) {
  if (!Array.isArray(posts)) return deepClone(DEFAULT_STATE.posts);
  return posts
    .map((post, index) => {
      if (!post || typeof post !== "object") return null;
      const title = typeof post.title === "string" ? post.title.trim() : "";
      const body = typeof post.body === "string" ? post.body.trim() : "";
      if (!title || !body) return null;
      const normalized = {
        id: typeof post.id === "string" && post.id.trim() ? post.id.trim() : `post-${index + 1}`,
        title,
        body,
        tags: Array.isArray(post.tags)
          ? post.tags.map((tag) => (typeof tag === "string" ? tag.trim() : "")).filter(Boolean)
          : [],
        published:
          typeof post.published === "string" && post.published.trim()
            ? post.published.trim()
            : new Date().toISOString().slice(0, 10)
      };
      if (post.image && typeof post.image === "object" && typeof post.image.src === "string") {
        const src = post.image.src.trim();
        if (src) {
          normalized.image = {
            src,
            alt:
              typeof post.image.alt === "string" && post.image.alt.trim() ? post.image.alt.trim() : `${title} illustration`
          };
        }
      }
      return normalized;
    })
    .filter(Boolean);
}

function normalizeState(value = {}) {
  const state = {
    about: typeof value.about === "string" && value.about.trim() ? value.about.trim() : DEFAULT_STATE.about,
    portfolioIntro:
      typeof value.portfolioIntro === "string" && value.portfolioIntro.trim()
        ? value.portfolioIntro.trim()
        : DEFAULT_STATE.portfolioIntro,
    contact: normalizeContact(value.contact),
    projects: normalizeProjects(value.projects),
    posts: normalizePosts(value.posts)
  };
  return state;
}

function loadState() {
  if (!canUseStorage) return deepClone(DEFAULT_STATE);
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return deepClone(DEFAULT_STATE);
  const parsed = safeParse(stored);
  if (!parsed) return deepClone(DEFAULT_STATE);
  return normalizeState(parsed);
}

function saveState(state) {
  if (!canUseStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = deepClone(DEFAULT_STATE);

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderAbout() {
  const container = document.querySelector("[data-about-text]");
  if (!container) return;
  container.innerHTML = "";
  state.about.split(/\n+/).forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;
    const p = document.createElement("p");
    p.textContent = trimmed;
    container.appendChild(p);
  });
}

function renderPortfolio() {
  const intro = document.querySelector("[data-portfolio-intro]");
  const grid = document.querySelector("[data-portfolio-grid]");
  if (intro) {
    intro.textContent = state.portfolioIntro;
  }
  if (!grid) return;
  grid.innerHTML = "";
  state.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "portfolio-card";
    card.setAttribute("role", "listitem");

    const title = document.createElement("h3");
    title.textContent = project.title;
    card.appendChild(title);

    const description = document.createElement("p");
    description.textContent = project.description;
    card.appendChild(description);

    if (project.media && project.media.src) {
      const image = document.createElement("img");
      image.src = project.media.src;
      image.alt = project.media.alt || project.title;
      card.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "project-placeholder";
      placeholder.textContent = "Space reserved for demos or embeds.";
      card.appendChild(placeholder);
    }

    grid.appendChild(card);
  });
}

function renderBlog() {
  const grid = document.querySelector("[data-blog-grid]");
  const empty = document.querySelector("[data-blog-empty]");
  if (!grid || !empty) return;

  const form = document.getElementById("blog-filter-form");
  let startDate = "";
  let endDate = "";
  let tag = "";
  if (form) {
    const formData = new FormData(form);
    startDate = formData.get("start-date") || "";
    endDate = formData.get("end-date") || "";
    tag = formData.get("tag-filter") || "";
  }

  const filtered = state.posts.filter((post) => {
    if (startDate && post.published < startDate) return false;
    if (endDate && post.published > endDate) return false;
    if (tag && !post.tags.includes(tag)) return false;
    return true;
  });

  grid.innerHTML = "";
  filtered.forEach((post) => {
    const card = document.createElement("article");
    card.className = "blog-card";

    const title = document.createElement("h3");
    title.textContent = post.title;
    card.appendChild(title);

    const date = document.createElement("p");
    date.className = "intro-text";
    date.textContent = formatDate(post.published);
    card.appendChild(date);

    if (post.image && post.image.src) {
      const image = document.createElement("img");
      image.src = post.image.src;
      image.alt = post.image.alt || post.title;
      card.appendChild(image);
    }

    const body = document.createElement("p");
    body.textContent = post.body;
    card.appendChild(body);

    if (post.tags.length) {
      const tagList = document.createElement("div");
      tagList.className = "tag-list";
      post.tags.forEach((label) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = label;
        tagList.appendChild(span);
      });
      card.appendChild(tagList);
    }

    grid.appendChild(card);
  });

  empty.hidden = filtered.length > 0;
}

function populateTagFilter() {
  const select = document.getElementById("tag-filter");
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">All tags</option>';
  const tags = new Set();
  state.posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  Array.from(tags)
    .sort((a, b) => a.localeCompare(b))
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      if (tag === current) {
        option.selected = true;
      }
      select.appendChild(option);
    });
}

function renderContact() {
  const list = document.querySelector("[data-contact-list]");
  if (!list) return;
  list.innerHTML = "";
  Object.entries(state.contact).forEach(([key, value]) => {
    if (!value) return;
    const link = document.createElement("a");
    link.className = "contact-link";
    link.setAttribute("role", "listitem");
    link.href = key === "email" ? `mailto:${value}` : value;
    if (key !== "email") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const icon = document.createElement("span");
    icon.textContent = CONTACT_ICONS[key] || "🔗";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent =
      key === "email" ? value : value.replace(/^https?:\/\/(www\.)?/i, "");

    link.append(icon, label);
    list.appendChild(link);
  });
}

function renderSite() {
  renderAbout();
  renderPortfolio();
  populateTagFilter();
  renderBlog();
  renderContact();
}

function setCurrentYear() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

function activateTab(target) {
  const buttons = document.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");
  buttons.forEach((button) => {
    const isActive = button.dataset.tabTarget === target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  panels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === target;
    panel.classList.toggle("active", isActive);
    if (isActive) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  });
}

function initTabs() {
  const buttons = document.querySelectorAll("[data-tab-target]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tabTarget;
      if (target) {
        activateTab(target);
      }
    });
  });
}

function initBlogFilters() {
  const form = document.getElementById("blog-filter-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderBlog();
  });
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      renderBlog();
    }, 0);
  });
}

function randomId(prefix) {
  if (hasWindow && window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function renderProjectTable() {
  const tableBody = document.getElementById("project-list");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  if (!state.projects.length) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No projects added yet.";
    emptyRow.appendChild(cell);
    tableBody.appendChild(emptyRow);
    return;
  }
  state.projects.forEach((project) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    titleCell.textContent = project.title;
    const actionCell = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      state.projects = state.projects.filter((item) => item.id !== project.id);
      saveState(state);
      renderPortfolio();
      renderProjectTable();
    });
    actionCell.appendChild(remove);
    row.append(titleCell, actionCell);
    tableBody.appendChild(row);
  });
}

function renderPostTable() {
  const tableBody = document.getElementById("post-list");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  if (!state.posts.length) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No blog posts yet.";
    emptyRow.appendChild(cell);
    tableBody.appendChild(emptyRow);
    return;
  }
  state.posts.forEach((post) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    titleCell.textContent = `${post.title} — ${formatDate(post.published)}`;
    const actionCell = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      state.posts = state.posts.filter((item) => item.id !== post.id);
      saveState(state);
      populateTagFilter();
      renderBlog();
      renderPostTable();
    });
    actionCell.appendChild(remove);
    row.append(titleCell, actionCell);
    tableBody.appendChild(row);
  });
}

function bindAdminForms() {
  if (!document.body.classList.contains("admin")) return;

  const sectionsForm = document.getElementById("sections-form");
  if (sectionsForm) {
    sectionsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(sectionsForm);
      state = normalizeState({
        ...state,
        about: (data.get("about-text") || "").toString(),
        portfolioIntro: (data.get("portfolio-intro-text") || "").toString(),
        contact: {
          email: (data.get("contact-email") || "").toString(),
          instagram: (data.get("contact-instagram") || "").toString(),
          facebook: (data.get("contact-facebook") || "").toString(),
          linkedin: (data.get("contact-linkedin") || "").toString()
        }
      });
      saveState(state);
      renderAbout();
      renderPortfolio();
      renderContact();
      const status = document.getElementById("sections-status");
      if (status) {
        status.textContent = "Details saved.";
        window.setTimeout(() => {
          status.textContent = "";
        }, 2000);
      }
    });

    const aboutField = sectionsForm.querySelector("#about-text");
    const introField = sectionsForm.querySelector("#portfolio-intro-text");
    const emailField = sectionsForm.querySelector("#contact-email");
    const instagramField = sectionsForm.querySelector("#contact-instagram");
    const facebookField = sectionsForm.querySelector("#contact-facebook");
    const linkedinField = sectionsForm.querySelector("#contact-linkedin");
    if (aboutField) aboutField.value = state.about;
    if (introField) introField.value = state.portfolioIntro;
    if (emailField) emailField.value = state.contact.email;
    if (instagramField) instagramField.value = state.contact.instagram;
    if (facebookField) facebookField.value = state.contact.facebook;
    if (linkedinField) linkedinField.value = state.contact.linkedin;
  }

  const projectForm = document.getElementById("project-form");
  if (projectForm) {
    projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(projectForm);
      const title = (data.get("project-title") || "").toString().trim();
      const description = (data.get("project-description") || "").toString().trim();
      if (!title || !description) return;
      const project = {
        id: randomId("project"),
        title,
        description
      };
      const mediaUrl = (data.get("project-media") || "").toString().trim();
      const mediaAlt = (data.get("project-media-alt") || "").toString().trim();
      if (mediaUrl) {
        project.media = {
          src: mediaUrl,
          alt: mediaAlt || `${title} preview`
        };
      }
      state.projects = normalizeProjects([...state.projects, project]);
      saveState(state);
      projectForm.reset();
      renderPortfolio();
      renderProjectTable();
      const status = document.getElementById("project-status");
      if (status) {
        status.textContent = "Project added.";
        window.setTimeout(() => {
          status.textContent = "";
        }, 2000);
      }
    });
  }

  const postForm = document.getElementById("post-form");
  if (postForm) {
    postForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(postForm);
      const title = (data.get("post-title") || "").toString().trim();
      const body = (data.get("post-body") || "").toString().trim();
      if (!title || !body) return;
      const rawTags = (data.get("post-tags") || "").toString();
      const post = {
        id: randomId("post"),
        title,
        body,
        tags: rawTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        published: (data.get("post-date") || "").toString().trim() || new Date().toISOString().slice(0, 10)
      };
      const imageUrl = (data.get("post-image") || "").toString().trim();
      const imageAlt = (data.get("post-image-alt") || "").toString().trim();
      if (imageUrl) {
        post.image = {
          src: imageUrl,
          alt: imageAlt || `${title} illustration`
        };
      }
      state.posts = normalizePosts([...state.posts, post]);
      saveState(state);
      postForm.reset();
      populateTagFilter();
      renderBlog();
      renderPostTable();
      const status = document.getElementById("post-status");
      if (status) {
        status.textContent = "Post published.";
        window.setTimeout(() => {
          status.textContent = "";
        }, 2000);
      }
    });
  }

  renderProjectTable();
  renderPostTable();
}

function initParticles() {
  const canvas = document.getElementById("background-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const particles = [];
  const maxParticles = 12;
  let hue = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function addParticle(x, y) {
    particles.push({
      x,
      y,
      radius: 26,
      life: 1,
      hue
    });
    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
    }
  }

  function update() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= 0.025;
      particle.radius *= 0.97;
      if (particle.life <= 0.05) {
        particles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.fillStyle = `hsla(${particle.hue}, 85%, 65%, ${particle.life})`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    window.requestAnimationFrame(update);
  }

  window.addEventListener("mousemove", (event) => {
    hue = (hue + 28) % 360;
    addParticle(event.clientX, event.clientY);
  });

  window.addEventListener("resize", resize);
  update();
}

function initSite() {
  state = loadState();
  renderSite();
  initTabs();
  initBlogFilters();
  setCurrentYear();
  bindAdminForms();
  initParticles();
}

if (hasWindow) {
  window.addEventListener("DOMContentLoaded", initSite);
}
