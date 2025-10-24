const STORAGE_KEY = "site-content";

const DEFAULT_CONTENT = {
  sections: {
    about: [
      "I'm a queer AI developer and community organizer who loves building empowering tools and joyful experiences.",
      "From leading hackathons to mentoring new technologists, I thrive where creativity and technology intersect.",
      "This site highlights the collaborations and experiments I'm most proud of."
    ].join("\n\n"),
    portfolioIntro:
      "A snapshot of in-progress and completed work. Each project saves room to embed a live demo or video when it's ready.",
    contact: {
      email: "hello@example.com",
      instagram: "https://instagram.com/yourhandle",
      facebook: "https://facebook.com/yourprofile",
      linkedin: "https://linkedin.com/in/yourprofile"
    }
  },
  projects: [
    {
      id: "community-signal-boost",
      title: "Community Signal Boost",
      description:
        "A platform that curates mutual aid requests and shares them with local networks in real time. The dashboard will live here soon.",
      media: {
        src: "work1.png",
        alt: "Screenshot of Community Signal Boost"
      }
    },
    {
      id: "xr-storytelling-lab",
      title: "XR Storytelling Lab",
      description:
        "Immersive storytelling experiments blending motion capture, AI-generated scenery, and collaborative workshops.",
      media: null
    },
    {
      id: "activist-data-commons",
      title: "Activist Data Commons",
      description:
        "Privacy-first data tools that help organizers measure impact without compromising community safety.",
      media: null
    }
  ],
  posts: [
    {
      id: "designing-for-joyful-mutual-aid",
      title: "Designing for Joyful Mutual Aid",
      body: "Exploring how community-driven design makes digital mutual aid spaces more welcoming and sustainable.",
      image: {
        src: "website_banner.png",
        alt: "Abstract rainbow banner"
      },
      tags: ["community", "activism"],
      published: "2024-05-12"
    }
  ]
};

const CONTACT_ICONS = {
  email: "📧",
  instagram: "📸",
  facebook: "📘",
  linkedin: "💼"
};

function supportsLocalStorage() {
  try {
    const key = "__storage_test__";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn("Local storage unavailable; using in-memory store.");
    return false;
  }
}

const canUseStorage = supportsLocalStorage();
const hasStructuredClone = typeof structuredClone === "function";
let memoryState = hasStructuredClone
  ? structuredClone(DEFAULT_CONTENT)
  : JSON.parse(JSON.stringify(DEFAULT_CONTENT));

function clone(value) {
  return hasStructuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function loadContent() {
  if (!canUseStorage) {
    return clone(memoryState);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveContent(DEFAULT_CONTENT);
    return clone(DEFAULT_CONTENT);
  }
  try {
    const parsed = JSON.parse(raw);
    const sections = {
      ...DEFAULT_CONTENT.sections,
      ...parsed.sections,
      contact: {
        ...DEFAULT_CONTENT.sections.contact,
        ...(parsed.sections?.contact || {})
      }
    };
    return {
      sections,
      projects: Array.isArray(parsed.projects) ? parsed.projects : clone(DEFAULT_CONTENT.projects),
      posts: Array.isArray(parsed.posts) ? parsed.posts : clone(DEFAULT_CONTENT.posts)
    };
  } catch (error) {
    console.warn("Unable to parse stored content; restoring defaults.");
    saveContent(DEFAULT_CONTENT);
    return clone(DEFAULT_CONTENT);
  }
}

function saveContent(content) {
  if (!canUseStorage) {
    memoryState = clone(content);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function updateYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initTabs() {
  const nav = document.querySelector(".tab-nav");
  if (!nav) return;

  const buttons = Array.from(nav.querySelectorAll("[role='tab']"));

  function activateTab(button) {
    buttons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) {
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      }
    });
    button.focus();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button));
    button.addEventListener("keydown", (event) => {
      const currentIndex = buttons.indexOf(button);
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = buttons[(currentIndex + 1) % buttons.length];
        activateTab(next);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prev = buttons[(currentIndex - 1 + buttons.length) % buttons.length];
        activateTab(prev);
      }
    });
  });
}

function renderAbout(section) {
  const container = document.getElementById("about-content");
  if (!container) return;
  container.innerHTML = "";
  const paragraphs = section.about
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  });
}

function renderPortfolioIntro(section) {
  const intro = document.getElementById("portfolio-intro");
  if (intro) {
    intro.textContent = section.portfolioIntro || "";
  }
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "portfolio-card";
  article.setAttribute("role", "listitem");

  if (project.media?.src) {
    const img = document.createElement("img");
    img.src = project.media.src;
    img.alt = project.media.alt || project.title;
    article.appendChild(img);
  }

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = project.title;
  header.appendChild(title);
  article.appendChild(header);

  const description = document.createElement("p");
  description.textContent = project.description;
  article.appendChild(description);

  const placeholder = document.createElement("div");
  placeholder.className = "project-placeholder";
  placeholder.textContent = "Space reserved for a live demo or media embed.";
  article.appendChild(placeholder);

  return article;
}

function renderPortfolio(projects) {
  const grid = document.getElementById("portfolio-grid");
  const empty = document.getElementById("portfolio-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  if (!projects.length) {
    empty.hidden = false;
    return;
  }

  projects.forEach((project) => {
    grid.appendChild(createProjectCard(project));
  });
  empty.hidden = true;
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "blog-card";
  article.setAttribute("role", "listitem");

  if (post.image?.src) {
    const img = document.createElement("img");
    img.src = post.image.src;
    img.alt = post.image.alt || post.title;
    article.appendChild(img);
  }

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = post.title;
  header.appendChild(title);

  if (post.published) {
    const meta = document.createElement("p");
    meta.className = "meta";
    const date = new Date(post.published);
    meta.textContent = `Published ${date.toLocaleDateString()}`;
    header.appendChild(meta);
  }

  article.appendChild(header);

  const body = document.createElement("p");
  body.textContent = post.body;
  article.appendChild(body);

  if (post.tags?.length) {
    const tagList = document.createElement("ul");
    tagList.className = "tag-list";
    post.tags.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      tagList.appendChild(li);
    });
    article.appendChild(tagList);
  }

  return article;
}

function renderBlogPosts(posts) {
  const grid = document.getElementById("blog-grid");
  const empty = document.getElementById("blog-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  if (!posts.length) {
    empty.hidden = false;
    return;
  }

  posts
    .slice()
    .sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0))
    .forEach((post) => grid.appendChild(createPostCard(post)));

  empty.hidden = true;
}

function renderContact(contact) {
  const list = document.getElementById("contact-list");
  if (!list) return;
  list.innerHTML = "";

  Object.entries(contact).forEach(([key, value]) => {
    if (!value) return;
    const item = document.createElement("a");
    item.href = key === "email" ? `mailto:${value}` : value;
    item.className = "contact-item";
    item.setAttribute("role", "listitem");
    if (key === "email") {
      item.removeAttribute("target");
      item.removeAttribute("rel");
    } else {
      item.target = "_blank";
      item.rel = "noreferrer noopener";
    }
    item.innerHTML = `<span class="icon">${CONTACT_ICONS[key] || "🔗"}</span><span>${value}</span>`;
    list.appendChild(item);
  });
}

function populateTagFilter(posts) {
  const select = document.getElementById("tag-filter");
  if (!select) return;
  const currentValue = select.value;

  const tags = new Set();
  posts.forEach((post) => post.tags?.forEach((tag) => tags.add(tag)));
  const sorted = Array.from(tags).sort((a, b) => a.localeCompare(b));

  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All tags";
  select.appendChild(defaultOption);

  sorted.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    if (tag === currentValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

let siteContent = null;

function applyFilters() {
  if (!siteContent) return;
  const form = document.getElementById("blog-filter-form");
  if (!form) {
    renderBlogPosts(siteContent.posts);
    return;
  }

  const start = form.querySelector("#start-date").value;
  const end = form.querySelector("#end-date").value;
  const tag = form.querySelector("#tag-filter").value;

  let filtered = siteContent.posts.slice();
  if (start) {
    filtered = filtered.filter((post) => !post.published || post.published >= start);
  }
  if (end) {
    filtered = filtered.filter((post) => !post.published || post.published <= end);
  }
  if (tag) {
    filtered = filtered.filter((post) => post.tags?.includes(tag));
  }
  renderBlogPosts(filtered);
}

function initBlogFilters() {
  const form = document.getElementById("blog-filter-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  form.addEventListener("reset", () => {
    requestAnimationFrame(() => {
      applyFilters();
    });
  });
}

function refreshSite(content) {
  siteContent = content;
  renderAbout(content.sections);
  renderPortfolioIntro(content.sections);
  renderPortfolio(content.projects);
  renderContact(content.sections.contact);
  populateTagFilter(content.posts);
  applyFilters();
}

function initSite() {
  siteContent = loadContent();
  refreshSite(siteContent);
  initBlogFilters();

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      refreshSite(loadContent());
    }
  });
}

function setStatusMessage(target, message) {
  if (!target) return;
  target.textContent = message;
  if (!message) return;
  setTimeout(() => {
    if (target.textContent === message) {
      target.textContent = "";
    }
  }, 3500);
}

function renderProjectAdminList(projects) {
  const list = document.getElementById("project-list");
  if (!list) return;
  list.innerHTML = "";

  if (!projects.length) {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.setAttribute("role", "row");
    const emptyCell = document.createElement("span");
    emptyCell.textContent = "No projects yet.";
    emptyCell.setAttribute("role", "cell");
    row.appendChild(emptyCell);
    const spacer = document.createElement("span");
    spacer.setAttribute("role", "cell");
    row.appendChild(spacer);
    list.appendChild(row);
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.setAttribute("role", "row");

    const nameCell = document.createElement("span");
    nameCell.textContent = project.title;
    nameCell.setAttribute("role", "cell");
    row.appendChild(nameCell);

    const actionCell = document.createElement("span");
    actionCell.setAttribute("role", "cell");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "link-button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const content = loadContent();
      content.projects = content.projects.filter((item) => item.id !== project.id);
      saveContent(content);
      renderProjectAdminList(content.projects);
      setStatusMessage(document.getElementById("project-status"), "Project removed.");
    });
    actionCell.appendChild(remove);
    row.appendChild(actionCell);

    list.appendChild(row);
  });
}

function renderPostAdminList(posts) {
  const list = document.getElementById("post-list");
  if (!list) return;
  list.innerHTML = "";

  if (!posts.length) {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.setAttribute("role", "row");

    ["No posts yet.", "", "", ""].forEach((text) => {
      const cell = document.createElement("span");
      cell.textContent = text;
      cell.setAttribute("role", "cell");
      row.appendChild(cell);
    });

    list.appendChild(row);
    return;
  }

  posts
    .slice()
    .sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0))
    .forEach((post) => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.setAttribute("role", "row");

      const titleCell = document.createElement("span");
      titleCell.textContent = post.title;
      titleCell.setAttribute("role", "cell");
      row.appendChild(titleCell);

      const dateCell = document.createElement("span");
      dateCell.textContent = post.published ? new Date(post.published).toLocaleDateString() : "Draft";
      dateCell.setAttribute("role", "cell");
      row.appendChild(dateCell);

      const tagCell = document.createElement("span");
      tagCell.textContent = post.tags?.join(", ") || "untagged";
      tagCell.setAttribute("role", "cell");
      row.appendChild(tagCell);

      const actionCell = document.createElement("span");
      actionCell.setAttribute("role", "cell");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "link-button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        const content = loadContent();
        content.posts = content.posts.filter((item) => item.id !== post.id);
        saveContent(content);
        renderPostAdminList(content.posts);
        setStatusMessage(document.getElementById("post-status"), "Post removed.");
      });
      actionCell.appendChild(remove);
      row.appendChild(actionCell);

      list.appendChild(row);
    });
}

function initSectionsForm(content) {
  const form = document.getElementById("sections-form");
  if (!form) return;

  const aboutField = form.querySelector("#about-text");
  const introField = form.querySelector("#portfolio-intro-text");
  const emailField = form.querySelector("#contact-email");
  const instagramField = form.querySelector("#contact-instagram");
  const facebookField = form.querySelector("#contact-facebook");
  const linkedinField = form.querySelector("#contact-linkedin");
  const status = document.getElementById("sections-status");

  aboutField.value = content.sections.about || "";
  introField.value = content.sections.portfolioIntro || "";
  emailField.value = content.sections.contact.email || "";
  instagramField.value = content.sections.contact.instagram || "";
  facebookField.value = content.sections.contact.facebook || "";
  linkedinField.value = content.sections.contact.linkedin || "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = loadContent();
    next.sections = {
      about: aboutField.value.trim(),
      portfolioIntro: introField.value.trim(),
      contact: {
        email: emailField.value.trim(),
        instagram: instagramField.value.trim(),
        facebook: facebookField.value.trim(),
        linkedin: linkedinField.value.trim()
      }
    };
    saveContent(next);
    setStatusMessage(status, "Sections updated.");
  });
}

function initProjectForm(content) {
  const form = document.getElementById("project-form");
  if (!form) return;

  const titleField = form.querySelector("#project-title");
  const descriptionField = form.querySelector("#project-description");
  const mediaField = form.querySelector("#project-media");
  const mediaAltField = form.querySelector("#project-media-alt");
  const status = document.getElementById("project-status");

  renderProjectAdminList(content.projects);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = loadContent();
    const project = {
      id: crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}`,
      title: titleField.value.trim(),
      description: descriptionField.value.trim()
    };
    const mediaUrl = mediaField.value.trim();
    const mediaAlt = mediaAltField.value.trim();
    if (mediaUrl) {
      project.media = { src: mediaUrl, alt: mediaAlt };
    }
    next.projects = [...next.projects, project];
    saveContent(next);
    form.reset();
    renderProjectAdminList(next.projects);
    setStatusMessage(status, "Project added.");
  });
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function initPostForm(content) {
  const form = document.getElementById("post-form");
  if (!form) return;

  const titleField = form.querySelector("#post-title");
  const imageField = form.querySelector("#post-image");
  const imageAltField = form.querySelector("#post-image-alt");
  const tagsField = form.querySelector("#post-tags");
  const dateField = form.querySelector("#post-date");
  const bodyField = form.querySelector("#post-body");
  const status = document.getElementById("post-status");

  renderPostAdminList(content.posts);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = loadContent();
    const post = {
      id: crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`,
      title: titleField.value.trim(),
      body: bodyField.value.trim(),
      tags: parseTags(tagsField.value),
      published: dateField.value
    };
    const imageUrl = imageField.value.trim();
    if (imageUrl) {
      post.image = { src: imageUrl, alt: imageAltField.value.trim() };
    }
    next.posts = [...next.posts, post];
    saveContent(next);
    form.reset();
    renderPostAdminList(next.posts);
    setStatusMessage(status, "Post saved.");
  });
}

function initAdmin() {
  const content = loadContent();
  initSectionsForm(content);
  initProjectForm(content);
  initPostForm(content);
}

function initCanvasTrail() {
  const canvas = document.getElementById("background-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let hue = 0;
  const particles = [];
  const MAX_PARTICLES = 6;

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.hue = hue;
      this.life = 1;
      this.radius = 22;
      this.decay = 0.08;
    }

    update() {
      this.life -= this.decay;
      this.radius *= 0.94;
    }

    draw() {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(this.radius, 4), 0, Math.PI * 2);
      ctx.strokeStyle = `hsl(${this.hue}, 90%, 60%)`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    get alive() {
      return this.life > 0;
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.update();
      if (!particle.alive) {
        particles.splice(i, 1);
        continue;
      }
      particle.draw();
    }
    requestAnimationFrame(tick);
  }

  tick();

  window.addEventListener("mousemove", (event) => {
    if (particles.length >= MAX_PARTICLES) {
      particles.shift();
    }
    particles.push(new Particle(event.clientX, event.clientY));
    hue = (hue + 45) % 360;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  initTabs();
  initCanvasTrail();
  if (document.body.classList.contains("admin")) {
    initAdmin();
  } else {
    initSite();
  }
});
