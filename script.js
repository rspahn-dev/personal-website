const STORAGE_KEY = "site-data";

const DEFAULT_DATA = {
  sections: {
    about: [
      "I'm Robin, a queer AI developer who blends code with community building.",
      "I love crafting playful experiments, thoughtful tools, and spaces where everyone feels welcome.",
      "This site highlights current projects, posts, and ways to connect."
    ].join("\n\n"),
    portfolioIntro:
      "A snapshot of projects in progress and favorites from recent collaborations. Each card leaves room for demos or visuals.",
    contact: {
      email: "hello@example.com",
      instagram: "https://instagram.com/yourhandle",
      facebook: "https://facebook.com/yourprofile",
      linkedin: "https://linkedin.com/in/yourprofile"
    }
  },
  projects: [
    {
      id: "project-1",
      title: "Community Signal Boost",
      description:
        "A platform that curates mutual aid requests and amplifies them across neighborhood networks in real time.",
      media: {
        src: "work1.png",
        alt: "Screenshot of Community Signal Boost"
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
      body: "Exploring how community-driven design makes digital mutual aid spaces more welcoming and sustainable.",
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
      body: "Notes from a workshop on empathetic AI assistants built with grassroots organizers.",
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
const supportsStructuredClone = typeof structuredClone === "function";

function clone(value) {
  if (supportsStructuredClone) {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function supportsLocalStorage() {
  if (!hasWindow) return false;
  try {
    const key = "__storage_test__";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn("Local storage unavailable; changes will reset on refresh.");
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

function normalizeSections(sections = {}) {
  const base = clone(DEFAULT_DATA.sections);
  if (typeof sections.about === "string" && sections.about.trim()) {
    base.about = sections.about.trim();
  }
  if (typeof sections.portfolioIntro === "string" && sections.portfolioIntro.trim()) {
    base.portfolioIntro = sections.portfolioIntro.trim();
  }
  if (sections.contact && typeof sections.contact === "object") {
    base.contact = { ...base.contact };
    for (const key of Object.keys(base.contact)) {
      if (typeof sections.contact[key] === "string" && sections.contact[key].trim()) {
        base.contact[key] = sections.contact[key].trim();
      }
    }
  }
  return base;
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return clone(DEFAULT_DATA.projects);
  return projects
    .map((project, index) => {
      if (!project || typeof project !== "object") return null;
      const title = typeof project.title === "string" ? project.title.trim() : "";
      const description = typeof project.description === "string" ? project.description.trim() : "";
      if (!title || !description) return null;
      const normalized = {
        id: typeof project.id === "string" && project.id.trim() ? project.id : `project-${index + 1}`,
        title,
        description
      };
      if (project.media && typeof project.media === "object" && typeof project.media.src === "string") {
        const src = project.media.src.trim();
        if (src) {
          normalized.media = {
            src,
            alt: typeof project.media.alt === "string" && project.media.alt.trim() ? project.media.alt.trim() : title
          };
        }
      }
      return normalized;
    })
    .filter(Boolean);
}

function normalizePosts(posts) {
  if (!Array.isArray(posts)) return clone(DEFAULT_DATA.posts);
  return posts
    .map((post, index) => {
      if (!post || typeof post !== "object") return null;
      const title = typeof post.title === "string" ? post.title.trim() : "";
      const body = typeof post.body === "string" ? post.body.trim() : "";
      if (!title || !body) return null;
      const normalized = {
        id: typeof post.id === "string" && post.id.trim() ? post.id : `post-${index + 1}`,
        title,
        body,
        tags: Array.isArray(post.tags)
          ? post.tags
              .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
              .filter(Boolean)
          : [],
        published:
          typeof post.published === "string" && post.published.trim() ? post.published.trim() : new Date().toISOString().slice(0, 10)
      };
      if (post.image && typeof post.image === "object" && typeof post.image.src === "string") {
        const src = post.image.src.trim();
        if (src) {
          normalized.image = {
            src,
            alt: typeof post.image.alt === "string" && post.image.alt.trim() ? post.image.alt.trim() : title
          };
        }
      }
      return normalized;
    })
    .filter(Boolean);
}

function loadState() {
  if (!canUseStorage) return clone(DEFAULT_DATA);
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return clone(DEFAULT_DATA);
  const parsed = safeParse(stored);
  if (!parsed) return clone(DEFAULT_DATA);
  return {
    sections: normalizeSections(parsed.sections),
    projects: normalizeProjects(parsed.projects),
    posts: normalizePosts(parsed.posts)
  };
}

function saveState(state) {
  if (!canUseStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function renderAbout() {
  const container = document.getElementById("about-content");
  if (!container) return;
  container.innerHTML = "";
  state.sections.about.split(/\n+/).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph.trim();
    container.appendChild(p);
  });
}

function renderPortfolio() {
  const intro = document.getElementById("portfolio-intro");
  const grid = document.getElementById("portfolio-grid");
  if (!intro || !grid) return;
  intro.textContent = state.sections.portfolioIntro;
  grid.innerHTML = "";
  state.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "portfolio-card";
    const title = document.createElement("h3");
    title.textContent = project.title;
    const description = document.createElement("p");
    description.textContent = project.description;
    card.append(title, description);
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
  const grid = document.getElementById("blog-grid");
  const empty = document.getElementById("blog-empty");
  const tagSelect = document.getElementById("tag-filter");
  if (!grid || !empty || !tagSelect) return;

  const form = document.getElementById("blog-filter-form");
  if (!form) return;
  const formData = new FormData(form);
  const startDate = formData.get("start-date");
  const endDate = formData.get("end-date");
  const tag = formData.get("tag-filter");

  let posts = state.posts.slice();
  if (startDate) {
    posts = posts.filter((post) => post.published >= startDate);
  }
  if (endDate) {
    posts = posts.filter((post) => post.published <= endDate);
  }
  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  grid.innerHTML = "";
  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "blog-card";
    const title = document.createElement("h3");
    title.textContent = post.title;
    const date = document.createElement("p");
    date.className = "intro-text";
    date.textContent = new Date(post.published).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const body = document.createElement("p");
    body.textContent = post.body;
    card.append(title, date);
    if (post.image && post.image.src) {
      const image = document.createElement("img");
      image.src = post.image.src;
      image.alt = post.image.alt || post.title;
      card.appendChild(image);
    }
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

  empty.hidden = posts.length > 0;
}

function populateTagFilter() {
  const select = document.getElementById("tag-filter");
  if (!select) return;
  const uniqueTags = new Set();
  state.posts.forEach((post) => {
    post.tags.forEach((tag) => uniqueTags.add(tag));
  });
  select.innerHTML = '<option value="">All tags</option>';
  uniqueTags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}

function renderContact() {
  const list = document.getElementById("contact-list");
  if (!list) return;
  list.innerHTML = "";
  const contact = state.sections.contact;
  Object.entries(contact).forEach(([key, value]) => {
    if (!value) return;
    const link = document.createElement("a");
    link.className = "contact-link";
    link.href = key === "email" ? `mailto:${value}` : value;
    link.target = key === "email" ? "_self" : "_blank";
    if (key !== "email") {
      link.rel = "noopener noreferrer";
    }
    link.setAttribute("role", "listitem");
    const icon = document.createElement("span");
    icon.textContent = CONTACT_ICONS[key] || "🔗";
    const label = document.createElement("span");
    label.textContent = value;
    link.append(icon, label);
    list.appendChild(link);
  });
}

function initTabs() {
  const buttons = Array.from(document.querySelectorAll(".tab-button"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.tab;
      buttons.forEach((other) => {
        const active = other === button;
        other.classList.toggle("active", active);
        other.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        const isTarget = panel.id === targetId;
        if (isTarget) {
          panel.classList.add("active");
          panel.removeAttribute("hidden");
        } else {
          panel.classList.remove("active");
          panel.setAttribute("hidden", "");
        }
      });
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

function initYear() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

function randomId(prefix) {
  if (hasWindow && window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function bindAdminForms() {
  if (!document.body.classList.contains("admin")) return;
  const sectionsForm = document.getElementById("sections-form");
  const projectForm = document.getElementById("project-form");
  const postForm = document.getElementById("post-form");
  const projectList = document.getElementById("project-list");
  const postList = document.getElementById("post-list");

  if (sectionsForm) {
    sectionsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(sectionsForm);
      state.sections = normalizeSections({
        about: formData.get("about-text"),
        portfolioIntro: formData.get("portfolio-intro-text"),
        contact: {
          email: formData.get("contact-email"),
          instagram: formData.get("contact-instagram"),
          facebook: formData.get("contact-facebook"),
          linkedin: formData.get("contact-linkedin")
        }
      });
      saveState(state);
      renderAbout();
      renderPortfolio();
      renderContact();
      const status = document.getElementById("sections-status");
      if (status) {
        status.textContent = "Sections updated.";
        window.setTimeout(() => (status.textContent = ""), 2000);
      }
    });

    const aboutField = sectionsForm.querySelector("#about-text");
    const introField = sectionsForm.querySelector("#portfolio-intro-text");
    const emailField = sectionsForm.querySelector("#contact-email");
    const instagramField = sectionsForm.querySelector("#contact-instagram");
    const facebookField = sectionsForm.querySelector("#contact-facebook");
    const linkedinField = sectionsForm.querySelector("#contact-linkedin");
    if (aboutField) aboutField.value = state.sections.about;
    if (introField) introField.value = state.sections.portfolioIntro;
    if (emailField) emailField.value = state.sections.contact.email;
    if (instagramField) instagramField.value = state.sections.contact.instagram;
    if (facebookField) facebookField.value = state.sections.contact.facebook;
    if (linkedinField) linkedinField.value = state.sections.contact.linkedin;
  }

  function renderProjectRows() {
    if (!projectList) return;
    projectList.innerHTML = "";
    state.projects.forEach((project) => {
      const row = document.createElement("div");
      row.className = "admin-row";
      const info = document.createElement("span");
      info.textContent = project.title;
      const actions = document.createElement("div");
      actions.className = "row-actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        state.projects = state.projects.filter((item) => item.id !== project.id);
        saveState(state);
        renderPortfolio();
        renderProjectRows();
      });
      actions.appendChild(remove);
      row.append(info, actions);
      projectList.appendChild(row);
    });
  }

  function renderPostRows() {
    if (!postList) return;
    postList.innerHTML = "";
    state.posts.forEach((post) => {
      const row = document.createElement("div");
      row.className = "admin-row";
      const info = document.createElement("span");
      info.textContent = `${post.title} — ${post.published}`;
      const actions = document.createElement("div");
      actions.className = "row-actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        state.posts = state.posts.filter((item) => item.id !== post.id);
        saveState(state);
        populateTagFilter();
        renderBlog();
        renderPostRows();
      });
      actions.appendChild(remove);
      row.append(info, actions);
      postList.appendChild(row);
    });
  }

  if (projectForm) {
    projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(projectForm);
      const project = {
        id: randomId("project"),
        title: formData.get("project-title").toString().trim(),
        description: formData.get("project-description").toString().trim(),
        media: null
      };
      const mediaUrl = formData.get("project-media").toString().trim();
      const mediaAlt = formData.get("project-media-alt").toString().trim();
      if (mediaUrl) {
        project.media = {
          src: mediaUrl,
          alt: mediaAlt || project.title
        };
      }
      state.projects = normalizeProjects([...state.projects, project]);
      saveState(state);
      projectForm.reset();
      renderPortfolio();
      renderProjectRows();
      const status = document.getElementById("project-status");
      if (status) {
        status.textContent = "Project added.";
        window.setTimeout(() => (status.textContent = ""), 2000);
      }
    });
  }

  if (postForm) {
    postForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(postForm);
      const tags = formData
        .get("post-tags")
        .toString()
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const post = {
        id: randomId("post"),
        title: formData.get("post-title").toString().trim(),
        body: formData.get("post-body").toString().trim(),
        tags,
        published: formData.get("post-date") ? formData.get("post-date").toString() : new Date().toISOString().slice(0, 10),
        image: null
      };
      const imageUrl = formData.get("post-image").toString().trim();
      const imageAlt = formData.get("post-image-alt").toString().trim();
      if (imageUrl) {
        post.image = { src: imageUrl, alt: imageAlt || post.title };
      }
      state.posts = normalizePosts([...state.posts, post]);
      saveState(state);
      postForm.reset();
      populateTagFilter();
      renderBlog();
      renderPostRows();
      const status = document.getElementById("post-status");
      if (status) {
        status.textContent = "Post published.";
        window.setTimeout(() => (status.textContent = ""), 2000);
      }
    });
  }

  renderProjectRows();
  renderPostRows();
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
      particle.life -= 0.02;
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
    hue = (hue + 24) % 360;
    addParticle(event.clientX, event.clientY);
  });

  window.addEventListener("resize", resize);
  update();
}

function renderSite() {
  renderAbout();
  renderPortfolio();
  populateTagFilter();
  renderBlog();
  renderContact();
}

if (hasWindow) {
  window.addEventListener("DOMContentLoaded", () => {
    state = loadState();
    renderSite();
    initTabs();
    initBlogFilters();
    initYear();
    bindAdminForms();
    initParticles();
  });
}
