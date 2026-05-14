/* ═══════════════════════════════════════════════
   NAV — elevation + burger mobile
═══════════════════════════════════════════════ */
const nav    = document.getElementById('nav');
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('nav-mobile');

window.addEventListener('scroll', () => {
    nav.classList.toggle('elevated', scrollY > 40);
}, { passive: true });

if (burger) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
}

function closeMobile() {
    burger && burger.classList.remove('open');
    mobileMenu && mobileMenu.classList.remove('open');
}

/* ═══════════════════════════════════════════════
   TYPING EFFECT
═══════════════════════════════════════════════ */
const PHRASES = ['UX/UI designer', 'Community manager', 'Concepteur multimédia'];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typing-text');

function type() {
    if (!typingEl) return;
    const current = PHRASES[phraseIdx];
    if (deleting) {
        charIdx--;
        typingEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % PHRASES.length;
            setTimeout(type, 400);
            return;
        }
        setTimeout(type, 40);
    } else {
        charIdx++;
        typingEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
            deleting = true;
            setTimeout(type, 2200);
            return;
        }
        setTimeout(type, 70 + Math.random() * 30);
    }
}
setTimeout(type, 1000);

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-left').forEach(el => io.observe(el));

/* ═══════════════════════════════════════════════
   PROJETS — rendu dynamique depuis PROJECTS
═══════════════════════════════════════════════ */
function renderProjects() {
    if (typeof PROJECTS === 'undefined') return;

    const listEl = document.getElementById('projects-list');
    const gridEl = document.getElementById('projects-grid');
    const filtersEl = document.getElementById('projects-filters');
    if (!listEl || !gridEl || !filtersEl) return;

    /* Filtres */
    (PROJECT_CATEGORIES || []).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat.id === 'all' ? ' active' : '');
        btn.dataset.filter = cat.id;
        btn.textContent = cat.label;
        btn.addEventListener('click', () => applyFilter(cat.id));
        filtersEl.appendChild(btn);
    });

    /* Vue liste */
    PROJECTS.forEach((p, i) => {
        const delay = i < 4 ? ` d${i % 4 + 1}` : '';
        const tagsHtml = p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('');
        const card = document.createElement('a');
        card.className = `proj-card reveal${delay}`;
        card.href = `projet.html?slug=${p.slug}`;
        card.dataset.categories = p.category.join(',');
        card.innerHTML = `
            <span class="proj-num">0${i + 1}</span>
            <div class="proj-info">
                <div class="proj-tags">${tagsHtml}</div>
                <h3 class="proj-name">${p.title}</h3>
                <p class="proj-desc">${p.summary}</p>
                <span class="proj-status">${p.status}</span>
            </div>
            <div class="proj-thumb-col ${p.thumb}" aria-hidden="true"></div>
            <span class="proj-arrow" aria-hidden="true">→</span>
        `;
        listEl.appendChild(card);
    });

    /* Vue grille */
    PROJECTS.forEach((p, i) => {
        const delay = i < 4 ? ` d${i % 4 + 1}` : '';
        const tagsHtml = p.tags.map(t => `<span class="proj-grid-tag">${t}</span>`).join('');
        const card = document.createElement('a');
        card.className = `proj-grid-card reveal${delay}`;
        card.href = `projet.html?slug=${p.slug}`;
        card.dataset.categories = p.category.join(',');
        card.innerHTML = `
            <div class="proj-grid-thumb">
                <div class="proj-grid-thumb-inner ${p.thumb}"></div>
            </div>
            <div class="proj-grid-body">
                <div class="proj-grid-tags">${tagsHtml}</div>
                <div class="proj-grid-name">${p.title}</div>
                <p class="proj-grid-desc">${p.summary}</p>
                <div class="proj-grid-footer">
                    <span class="proj-grid-status">${p.status}</span>
                    <span class="proj-grid-arrow">→</span>
                </div>
            </div>
        `;
        gridEl.appendChild(card);
    });

    /* Observer les nouvelles cards */
    document.querySelectorAll('.proj-card, .proj-grid-card').forEach(el => io.observe(el));
}

function applyFilter(catId) {
    /* Activer le bon bouton */
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === catId);
    });

    /* Masquer / afficher les cards */
    document.querySelectorAll('[data-categories]').forEach(card => {
        const cats = card.dataset.categories.split(',');
        const show = catId === 'all' || cats.includes(catId);
        card.classList.toggle('filtered-out', !show);
    });
}

/* ═══════════════════════════════════════════════
   TOGGLE VUE LISTE / GRILLE
═══════════════════════════════════════════════ */
function initViewToggle() {
    const btnList  = document.getElementById('view-list');
    const btnGrid  = document.getElementById('view-grid');
    const listView = document.getElementById('projects-list');
    const gridView = document.getElementById('projects-grid');
    if (!btnList || !btnGrid) return;

    btnList.addEventListener('click', () => {
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
        listView.classList.remove('hidden');
        gridView.classList.add('hidden');
    });

    btnGrid.addEventListener('click', () => {
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
        gridView.classList.remove('hidden');
        listView.classList.add('hidden');
    });
}

/* ═══════════════════════════════════════════════
   SKILLS TABS
═══════════════════════════════════════════════ */
function initSkillsTabs() {
    const tabs   = document.querySelectorAll('.stab');
    const panels = document.querySelectorAll('.spanel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const panel = document.getElementById('sp-' + tab.dataset.tab);
            if (panel) panel.classList.add('active');
        });
    });
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
renderProjects();
initViewToggle();
initSkillsTabs();

/* ═════════ VARIANTE B — Flowfield hero ═════════ */
(function () {
    const cvs = document.getElementById('vbFlowfield');
    if (!cvs) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cvs.getContext('2d');

    let w, h, mx = 0.5, my = 0.5, particles = [];
    const COUNT = window.innerWidth < 768 ? 60 : 140;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = cvs.getBoundingClientRect();
        w = rect.width; h = rect.height;
        cvs.width = w * dpr; cvs.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
        particles = [];
        for (let i = 0; i < COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: 0, vy: 0,
                life: Math.random() * 200,
                hue: Math.random() < 0.7 ? 170 : 280
            });
        }
    }
    resize(); init();
    window.addEventListener('resize', () => { resize(); init(); });

    cvs.parentElement.addEventListener('mousemove', (e) => {
        const r = cvs.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width;
        my = (e.clientY - r.top)  / r.height;
    });

    let t = 0;
    function noise(x, y) {
        // simple pseudo-noise via trig
        return Math.sin(x * 0.9 + t) * Math.cos(y * 0.9 - t * 0.7);
    }

    function loop() {
        t += 0.004;
        ctx.fillStyle = 'rgba(10, 42, 51, 0.08)';
        ctx.fillRect(0, 0, w, h);

        for (const p of particles) {
            const nx = p.x / w * 3;
            const ny = p.y / h * 3;
            const angle = noise(nx, ny) * Math.PI * 2;
            const mouseInfluence = 1 + Math.hypot(p.x / w - mx, p.y / h - my) < 0.3 ? 1.4 : 1;
            p.vx += Math.cos(angle) * 0.08 * mouseInfluence;
            p.vy += Math.sin(angle) * 0.08 * mouseInfluence;
            p.vx *= 0.94; p.vy *= 0.94;
            p.x += p.vx; p.y += p.vy;
            p.life--;

            if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
                p.x = Math.random() * w; p.y = Math.random() * h;
                p.vx = p.vy = 0; p.life = 200 + Math.random() * 200;
            }

            const alpha = Math.min(0.5, p.life / 400);
            ctx.fillStyle = `hsla(${p.hue}, 75%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(loop);
    }
    loop();
})();

/* ═════════ ALTERNANCE SECTIONS — indicateur + flash ═════════ */
(function () {
    const sections = Array.from(document.querySelectorAll('section[data-sec]'));
    if (!sections.length) return;

    const dots   = Array.from(document.querySelectorAll('.si-dot'));
    const flash  = document.getElementById('secFlash');
    const sfNum  = document.getElementById('sfNum');
    const sfName = document.getElementById('sfName');

    const META = {
        hero:        { num: '00', name: 'Accueil' },
        about:       { num: '01', name: 'Qui suis-je' },
        competences: { num: '02', name: 'Compétences' },
        outils:      { num: '03', name: 'Outils' },
        projets:     { num: '04', name: 'Projets' },
        parcours:    { num: '05', name: 'Parcours' },
        contact:     { num: '06', name: 'Contact' }
    };

    let current = 'hero';
    let flashTimer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setActive(name) {
        if (name === current) return;
        const idx = sections.findIndex(s => s.dataset.sec === name);

        document.body.setAttribute('data-section', name);
        current = name;

        dots.forEach(d => {
            const i = sections.findIndex(s => s.dataset.sec === d.dataset.jump);
            d.classList.toggle('is-active', d.dataset.jump === name);
            d.classList.toggle('is-passed', i >= 0 && idx >= 0 && i < idx);
        });

        // Flash : seulement si pas hero, et pas en reduced-motion
        if (name !== 'hero' && !reduceMotion && META[name]) {
            sfNum.textContent  = META[name].num;
            sfName.textContent = META[name].name;
            flash.classList.add('is-show');
            clearTimeout(flashTimer);
            flashTimer = setTimeout(() => flash.classList.remove('is-show'), 750);
        }
    }

    const io = new IntersectionObserver((entries) => {
        // sélectionner la section dont le ratio visible est le plus grand
        let best = null;
        entries.forEach(e => {
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        });
        if (best && best.isIntersecting) {
            setActive(best.target.dataset.sec);
        }
    }, { threshold: [0.35, 0.55, 0.75] });

    sections.forEach(s => io.observe(s));

    // Détecter aussi le hero (n'a pas data-sec)
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroIO = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting && e.intersectionRatio > 0.4) setActive('hero'); });
        }, { threshold: [0.4, 0.6] });
        heroIO.observe(hero);
    }
})();
