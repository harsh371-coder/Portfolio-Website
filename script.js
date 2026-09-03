// LOADER
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  const counter = document.getElementById('loaderCounter');
  const name = document.getElementById('loaderName');
  gsap.to(name, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        gsap.to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut',
          onComplete: () => { loader.style.display = 'none'; initAnimations(); } });
      }, 250);
    }
    bar.style.width = progress + '%';
    counter.textContent = String(Math.floor(progress)).padStart(3, '0');
  }, 55);
});

// CURSOR
const cursor = document.getElementById('cursor');
const isMobile = () => window.innerWidth <= 900;
document.addEventListener('mousemove', (e) => {
  if (isMobile()) return;
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .skill-tag, .skill-card, .project-visual, .repo-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

const scrollProgressEl = document.getElementById('scroll-progress');
const toTopBtn = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollProgressEl.style.width = pct + '%';
  toTopBtn.classList.toggle('show', window.scrollY > 700);
});
toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ACTIVE NAV SECTION
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionEls = Array.from(navAnchors).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sectionEls.forEach(s => navObserver.observe(s));

// HERO PARALLAX (desktop only)
if (!isMobile()) {
  const blob1 = document.getElementById('blob1');
  const blob2 = document.getElementById('blob2');
  const heroEl = document.getElementById('hero');
  heroEl.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    blob1.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
    blob2.style.transform = `translate(${x * 25}px, ${y * 25}px)`;
  });
}

// PROJECT VISUAL TILT (desktop only)
if (!isMobile()) {
  document.querySelectorAll('.project-visual').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) scale(1.015)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)'; });
  });
}

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.set('.hero-title .l1, .hero-title .l2', { yPercent: 110 });
  gsap.to('.hero-title .l1, .hero-title .l2', { yPercent: 0, stagger: 0.12, duration: 1, ease: 'power4.out' });
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' } });
  });
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    ScrollTrigger.create({ trigger: el, start: 'top 90%',
      onEnter: () => { gsap.to({ val: 0 }, { val: target, duration: 1.1, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val); } }); } });
  });

  document.querySelectorAll('.skill-card').forEach(card => {
    gsap.from(card.querySelectorAll('.skill-tag'), { opacity: 0, y: 8, stagger: 0.04, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 85%' } });
  });
  document.querySelectorAll('.project-row').forEach(row => {
    gsap.from(row.querySelectorAll('.project-tags span'), { opacity: 0, y: 8, stagger: 0.05, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 75%' } });
  });
}

// MARQUEE
const TECHS = ['TensorFlow','Keras','Deep Learning','Scikit-learn','Python','Java','SQL','Generative AI','Pandas','NumPy','Git','GitHub','MySQL','LangChain','Multi-Agent Systems','CNNs / U-Net'];
const track = document.getElementById('marqueeTrack');
const buildMarquee = () => TECHS.map(t => `<span class="marquee-item">${t}</span><span class="marquee-item marquee-sep">◆</span>`).join('');
track.innerHTML = buildMarquee() + buildMarquee();

// GITHUB LIVE DATA (cached in localStorage for 1 hour to avoid hitting GitHub's rate limit)
const GH_USER = 'harsh371-coder';
const GH_CACHE_KEY = 'gh_repos_cache_v1';
const GH_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function renderRepos(repos) {
  document.getElementById('ghRepoCount').textContent = repos.length;

  const langCount = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const langEntries = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  const langHtml = langEntries.length
    ? langEntries.map(([lang, count]) => `<span class="gh-lang-tag">${lang} · ${count}</span>`).join('')
    : '<span class="gh-lang-tag">—</span>';
  document.getElementById('ghLangs').innerHTML = langHtml;

  const sorted = repos.slice().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const cardsHtml = sorted.slice(0, 4).map(r => `
    <a href="${r.html_url}" target="_blank" class="repo-card" style="display:block;">
      <div class="repo-card-top">
        <span class="repo-card-name">${r.name}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="color:var(--teal);"><path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" stroke-width="1.4"/></svg>
      </div>
      <div class="repo-card-desc">${r.description ? r.description : 'No description provided.'}</div>
      <div class="repo-card-meta">
        ${r.language ? `<span><span class="lang-dot"></span>${r.language}</span>` : ''}
        <span>★ ${r.stargazers_count}</span>
        <span>⑂ ${r.forks_count}</span>
      </div>
    </a>`).join('');
  document.getElementById('repoGrid').innerHTML = cardsHtml || '<div class="repo-card">No public repositories found.</div>';
}

function readGhCache() {
  try {
    const raw = localStorage.getItem(GH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

async function fetchGitHub() {
  const cached = readGhCache();
  const isFresh = cached && (Date.now() - cached.savedAt < GH_CACHE_TTL);

  // Show cached data immediately (fresh or stale) so the section never sits empty.
  if (cached) renderRepos(cached.repos);
  if (isFresh) return; // cache is recent enough — skip the network call entirely

  try {
    const reposRes = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`);
    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        renderRepos(repos);
        try { localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos })); } catch (e) {}
      }
    } else if (!cached) {
      document.getElementById('ghLangs').innerHTML = '<span class="gh-lang-tag">Unable to load — GitHub API rate limit reached</span>';
      document.getElementById('repoGrid').innerHTML = '<div class="repo-card">Unable to load repositories right now — try again in a bit.</div>';
    }
  } catch (e) {
    if (!cached) {
      document.getElementById('ghLangs').innerHTML = '<span class="gh-lang-tag">Unable to load — offline or GitHub unreachable</span>';
      document.getElementById('repoGrid').innerHTML = '<div class="repo-card">Unable to load repositories right now.</div>';
    }
  }
}
fetchGitHub();

// CONTACT FORM — submits via Web3Forms (https://web3forms.com), a free form-backend
// service. Get your own access key at web3forms.com (just enter an email, no signup)
// and paste it below. Until a real key is set (or if a submission fails), the form
// shows a clickable "email me directly" link instead of forcing a mailto: redirect —
// auto-navigating to mailto: pops a confusing "pick an app" dialog on systems with no
// default mail client, so the visitor should choose to click it, not have it forced on them.
const WEB3FORMS_ACCESS_KEY = '6cd1505c-e0ea-4fcf-ad88-e49d09e80e58';

function showEmailFallback(prefix) {
  const note = document.getElementById('formNote');
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const subject = document.getElementById('fsubject').value || 'Portfolio inquiry';
  const message = document.getElementById('fmsg').value;
  const body = `From: ${name} (${email})\n\n${message}`;
  const mailtoUrl = `mailto:connect.harsh86@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.innerHTML = `${prefix} <a href="${mailtoUrl}" style="color:var(--teal); text-decoration:underline;">email me directly</a> at connect.harsh86@gmail.com.`;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const subject = document.getElementById('fsubject').value || 'Portfolio inquiry';
  const message = document.getElementById('fmsg').value;
  const btnText = document.getElementById('formBtnText');
  const note = document.getElementById('formNote');

  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith('YOUR-')) {
    showEmailFallback("This form isn't fully wired up yet — please");
    return;
  }

  btnText.textContent = 'Sending…';
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name, email, subject, message,
        from_name: 'Portfolio Contact Form',
      }),
    });
    const data = await res.json();
    if (data.success) {
      btnText.textContent = 'Message Sent ✓';
      note.textContent = "Thanks — I'll get back to you soon.";
      document.getElementById('contactForm').reset();
      setTimeout(() => { btnText.textContent = 'Send Message'; }, 3000);
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    btnText.textContent = 'Send Message';
    showEmailFallback('Something went wrong on our end — please');
  }
}

// MOBILE MENU
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('open'); }

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' }); }
  });
});
