// Utilities
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Year
$("#y").textContent = new Date().getFullYear();

// Toolbar: Pride + Theme toggles
(function initToolbar(){
  const prideBtn = document.createElement('button');
  prideBtn.className = 'fab';
  prideBtn.title = 'Toggle Pride mode';
  prideBtn.setAttribute('aria-pressed','false');
  prideBtn.innerHTML = '🏳️‍🌈';
  prideBtn.addEventListener('click', () => {
    const on = document.body.toggleAttribute('data-pride');
    prideBtn.setAttribute('aria-pressed', String(on));
    if(on && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti();
  });

  const themeBtn = document.createElement('button');
  themeBtn.className = 'fab';
  themeBtn.title = 'Toggle light/dark';
  themeBtn.setAttribute('aria-pressed','false');
  themeBtn.innerHTML = '🌓';
  themeBtn.addEventListener('click', () => {
    const on = document.documentElement.toggleAttribute('data-light');
    themeBtn.setAttribute('aria-pressed', String(on));
    const meta = document.querySelector('meta[name="theme-color"]');
    meta.setAttribute('content', on ? '#ffffff' : '#0b0b0f');
  });

  const bar = document.createElement('div');
  bar.className = 'toolbar';
  bar.append(prideBtn, themeBtn);
  document.body.append(bar);

  // Pride background CSS hook
  const style = document.createElement('style');
  style.textContent = `
    body[data-pride]{
      background-image: var(--grad-float), repeating-conic-gradient(from 0deg, rgba(255,255,255,.015) 0 10deg, transparent 10deg 20deg);
      outline: 6px solid transparent; outline-offset: 0;
    }
  `;
  document.head.append(style);
})();

// Confetti (no deps)
function confetti(){
  const n = 80;
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    Object.assign(s.style, {
      position:'fixed', left: Math.random()*100+'vw', top:'-10px', width:'8px', height:'14px',
      background: ['#e40303','#ff8c00','#ffed00','#008026','#004dff','#750787','#000','#784f17','#fff'][i % 9],
      transform:`rotate(${Math.random()*360}deg)`,
      borderRadius:'2px', zIndex:70, pointerEvents:'none'
    });
    document.body.appendChild(s);
    const x = (Math.random()*2-1)*120; // drift
    s.animate([
      { transform:s.style.transform, top:'-10px' },
      { transform:`translate(${x}px, 100vh) rotate(${Math.random()*360}deg)`, top:'100vh' }
    ], { duration: 1500 + Math.random()*1500, easing:'cubic-bezier(.2,.7,.2,1)' }).onfinish = ()=> s.remove();
  }
}

// Blog tabs (Markdown vs CMS)
(function initBlogTabs(){
  const mdTab = $("#mdTab");
  const cmsTab = $("#cmsTab");
  const mdPanel = $("#mdPanel");
  const cmsPanel = $("#cmsPanel");

  function activate(tab){
    [mdTab, cmsTab].forEach(t => {
      const selected = (t === tab);
      t.classList.toggle('is-active', selected);
      t.setAttribute('aria-selected', String(selected));
    });
    const showMd = tab === mdTab;
    mdPanel.hidden = !showMd; mdPanel.classList.toggle('is-active', showMd);
    cmsPanel.hidden = showMd; cmsPanel.classList.toggle('is-active', !showMd);
  }

  mdTab.addEventListener('click', () => activate(mdTab));
  cmsTab.addEventListener('click', () => activate(cmsTab));
})();

// Markdown loader (client-side, zero build tools)
// Put .md files into /blog/ and list them here:
const markdownPosts = [
  { file: 'hello-world.md', title: 'Hello World', date: '2025-01-01' },
  // Add more: { file: 'queer-ui-principles.md', title:'Queer UI Principles', date:'2025-02-18' }
];

(async function loadMarkdownPosts(){
  const list = $("#mdPosts");
  if(!list) return;
  if(markdownPosts.length === 0){
    list.innerHTML = '<li><span>No posts yet. Add .md files to /blog/.</span></li>';
    return;
  }
  for(const post of markdownPosts){
    const li = document.createElement('li');
    const a = document.createElement('a'); a.href = `blog/${encodeURIComponent(post.file)}`; a.textContent = post.title;
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const res = await fetch(a.href);
      if(!res.ok){ alert('Could not load markdown file.'); return; }
      const text = await res.text();
      openMarkdownModal(post.title, text);
    });
    const meta = document.createElement('time'); meta.dateTime = post.date; meta.textContent = new Date(post.date).toLocaleDateString();
    li.append(a, meta);
    list.append(li);
  }
})();

// Minimal Markdown → HTML (safe subset)
function mdToHtml(md){
  // Escape HTML
  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Headings, bold, italic, code, links, lists, paragraphs
  let html = esc(md)
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\s*[-*] (.*)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<h\d|<ul|<li|<p|<\/)(.+)$/gim, '<p>$1</p>');
  return html;
}

// Simple modal to render Markdown content
function openMarkdownModal(title, md){
  const dlg = document.createElement('dialog');
  dlg.setAttribute('aria-label', title);
  dlg.innerHTML = `
    <form method="dialog" class="card" style="max-width:min(800px, 90vw); border:0">
      <header style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <h3 style="margin:0">${title}</h3>
        <button class="btn" value="close" aria-label="Close dialog">Close</button>
      </header>
      <div class="muted" style="margin:.5rem 0 1rem">Markdown preview</div>
      <div class="md-body" style="max-height:60vh; overflow:auto"></div>
    </form>
  `;
  document.body.appendChild(dlg);
  dlg.querySelector('.md-body').innerHTML = mdToHtml(md);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
}

// Headless CMS loader (placeholder)
async function loadCmsPosts(){
  // Example skeleton — replace with your CMS fetch:
  // const res = await fetch('https://cms.example/posts');
  // const posts = await res.json();
  const posts = [
    { title: 'Coming from CMS soon', url: '#', date: '2025-03-01' }
  ];
  const list = $("#cmsPosts");
  list.innerHTML = '';
  for(const p of posts){
    const li = document.createElement('li');
    const a = document.createElement('a'); a.href = p.url; a.textContent = p.title;
    const meta = document.createElement('time'); meta.dateTime = p.date; meta.textContent = new Date(p.date).toLocaleDateString();
    li.append(a, meta);
    list.append(li);
  }
}
loadCmsPosts();

// Contact form (replace endpoint as needed)
(function initForm(){
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Basic validation
    if(!data.name || !data.email || !data.message){
      note.textContent = "Please complete all fields.";
      note.style.color = "var(--warn)";
      return;
    }

    try{
      // TODO: connect to your backend or Formspree/Getform/Netlify:
      // await fetch('YOUR_ENDPOINT_HERE', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      note.textContent = "Thanks! I’ll reply within 1–2 business days.";
      note.style.color = "var(--ok)";
      form.reset();
    }catch(err){
      note.textContent = "Something went wrong. Please email me directly.";
      note.style.color = "var(--err)";
    }
  });
})();

// Enhance JSON-LD with final site URL if hosted under a domain
(function initJsonLd(){
  const json = JSON.parse(document.getElementById('person-jsonld').textContent);
  if(location.hostname && location.hostname !== 'localhost'){
    json.url = location.origin;
  }
  document.getElementById('person-jsonld').textContent = JSON.stringify(json);
})();
