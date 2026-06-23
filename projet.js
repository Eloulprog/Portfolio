/* Charge les données du projet depuis le slug en URL */
(function () {
    const params = new URLSearchParams(location.search);
    const slug   = params.get('slug');
    const projet = (typeof PROJECTS !== 'undefined') && PROJECTS.find(p => p.slug === slug);

    if (!projet) {
        document.getElementById('projet-title').textContent = 'Projet introuvable';
        return;
    }

    /* Titre de page */
    document.title = `${projet.title} — Elouen Le Pendeven`;

    /* Header */
    document.getElementById('projet-title').textContent   = projet.title;
    document.getElementById('projet-summary').textContent = projet.summary;
    document.getElementById('projet-date').textContent    = projet.date || '';

    const tagsEl = document.getElementById('projet-tags');
    projet.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'projet-tag';
        span.textContent = t;
        tagsEl.appendChild(span);
    });

    /* Sidebar */
    const toolsEl = document.getElementById('projet-tools');
    projet.tools.forEach(tool => {
        const chip = document.createElement('span');
        chip.className = 'projet-tool-chip';
        chip.textContent = tool;
        toolsEl.appendChild(chip);
    });

    const catLabel = id => {
        const found = (typeof PROJECT_CATEGORIES !== 'undefined')
            && PROJECT_CATEGORIES.find(c => c.id === id);
        return found ? found.label : id;
    };
    /* On retire 'iut' : déjà affiché dans le bloc Contexte juste en dessous */
    const catEl = document.getElementById('projet-cat');
    const cats  = projet.category.filter(id => id !== 'iut');
    if (cats.length) {
        cats.forEach(id => {
            const chip = document.createElement('span');
            chip.className = 'projet-cat-chip';
            chip.textContent = catLabel(id);
            catEl.appendChild(chip);
        });
    } else {
        catEl.closest('.projet-aside-block').style.display = 'none';
    }
    document.getElementById('projet-stat-val').textContent = projet.status || '—';

    if (projet.label) {
        const labelBlock = document.getElementById('projet-label-block');
        if (labelBlock) {
            labelBlock.style.display = '';
            document.getElementById('projet-label-val').textContent = projet.label;
        }
    }

    if (projet.feat && projet.feat.length) {
        const featBlock = document.getElementById('projet-feat-block');
        const featEl = document.getElementById('projet-feat');
        if (featBlock && featEl) {
            featBlock.style.display = '';
            projet.feat.forEach(person => {
                const a = document.createElement('a');
                a.className = 'projet-feat-link';
                a.href = person.href;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.innerHTML = `${person.name} <span aria-hidden="true">↗</span>`;
                featEl.appendChild(a);
            });
        }
    }

    /* Sections */
    document.getElementById('section-presentation').innerHTML = `<p>${projet.summary}</p>`;
    document.getElementById('section-role').innerHTML   = `<p>${projet.role}</p>`;
    document.getElementById('section-process').innerHTML = `<p>${projet.process}</p>`;
    document.getElementById('section-result').innerHTML  = `<p>${projet.result}</p>`;

    const toolsListEl = document.getElementById('section-tools');
    projet.tools.forEach(tool => {
        const badge = document.createElement('span');
        badge.className = 'projet-tool-badge';
        badge.textContent = tool;
        toolsListEl.appendChild(badge);
    });

    /* Visuel : vidéo(s) si fournie(s), sinon thumb gradient */
    const visual = document.getElementById('projet-visual');
    const visualWrap = visual ? visual.parentElement : null;
    const videos = projet.videos || (projet.video ? [{ url: projet.video }] : []);
    if (visual) {
        if (videos.length) {
            const wrap = visualWrap;
            wrap.innerHTML = '';
            videos.forEach(v => {
                const url = typeof v === 'string' ? v : v.url;
                const caption = (typeof v === 'object' && v.label) ? v.label : '';
                const isFigma   = /figma\.com/.test(url);
                const isYoutube = /youtube\.com|youtu\.be/.test(url);
                const loadLabel = isFigma   ? 'Charger le prototype'
                                : isYoutube ? 'Lire la vidéo'
                                :             'Charger le contenu';

                const frame = document.createElement('div');
                frame.className = 'projet-visual-inner projet-visual-video' + (isFigma ? ' projet-visual-figma' : '');

                const chrome = isFigma ? `
                    <div class="figma-chrome">
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-label">Prototype Figma</span>
                        <a class="figma-chrome-expand" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir en plein écran">↗</a>
                    </div>` : '';
                const posterImg = projet.image
                    ? `<img class="embed-poster-img" src="${projet.image}" alt="" loading="lazy">`
                    : '';

                /* Click-to-load : on ne charge l'iframe (souvent plusieurs Mo + cookies tiers)
                   qu'au clic. Le poster occupe déjà la taille finale → pas de décalage (CLS). */
                frame.innerHTML = chrome + `
                    <button class="embed-poster" type="button" aria-label="${loadLabel}">
                        ${posterImg}
                        <span class="embed-poster-cta">
                            <span class="embed-poster-icon" aria-hidden="true">${isYoutube ? '▶' : '↗'}</span>
                            ${loadLabel}
                        </span>
                        <span class="embed-poster-hint">Contenu externe chargé au clic</span>
                    </button>`;

                const poster = frame.querySelector('.embed-poster');
                poster.addEventListener('click', () => {
                    let src = url;
                    if (isYoutube) src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
                    const iframe = document.createElement('iframe');
                    iframe.src = src;
                    iframe.title = projet.title + (caption ? ' — ' + caption : '');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                    iframe.allowFullscreen = true;
                    poster.replaceWith(iframe);
                });

                wrap.appendChild(frame);
                if (caption) {
                    const cap = document.createElement('p');
                    cap.className = 'projet-visual-caption';
                    cap.textContent = caption;
                    wrap.appendChild(cap);
                }
            });
        } else {
            visual.className = `projet-visual-inner ${projet.thumb}`;
            visual.innerHTML = '';
        }
    }

    /* Liens externes (Instagram, site, etc.) */
    if (projet.links && projet.links.length && visualWrap) {
        const linksWrap = document.createElement('div');
        linksWrap.className = 'projet-links';
        projet.links.forEach(l => {
            const a = document.createElement('a');
            a.className = 'projet-link-btn';
            a.href = l.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `${l.label} <span aria-hidden="true">↗</span>`;
            linksWrap.appendChild(a);
        });
        visualWrap.insertAdjacentElement('afterend', linksWrap);
    }

    /* Navigation prev / next */
    const idx  = PROJECTS.findIndex(p => p.slug === slug);
    const prev = PROJECTS[idx - 1];
    const next = PROJECTS[idx + 1];

    const prevBtn = document.getElementById('prev-projet');
    const nextBtn = document.getElementById('next-projet');
    if (prevBtn) {
        prev ? (prevBtn.href = `projet.html?slug=${prev.slug}`) : prevBtn.remove();
    }
    if (nextBtn) {
        next ? (nextBtn.href = `projet.html?slug=${next.slug}`) : nextBtn.remove();
    }
})();
