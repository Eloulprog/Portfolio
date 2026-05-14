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

    document.getElementById('projet-cat').textContent      = projet.category.join(', ');
    document.getElementById('projet-stat-val').textContent = projet.status || '—';

    if (projet.label) {
        const labelBlock = document.getElementById('projet-label-block');
        if (labelBlock) {
            labelBlock.style.display = '';
            document.getElementById('projet-label-val').textContent = projet.label;
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
                const isFigma = /figma\.com/.test(url);
                const frame = document.createElement('div');
                frame.className = 'projet-visual-inner projet-visual-video' + (isFigma ? ' projet-visual-figma' : '');
                frame.innerHTML = `
                    ${isFigma ? `
                        <div class="figma-chrome">
                            <span class="figma-chrome-dot"></span>
                            <span class="figma-chrome-dot"></span>
                            <span class="figma-chrome-dot"></span>
                            <span class="figma-chrome-label">Prototype Figma</span>
                            <a class="figma-chrome-expand" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir en plein écran">↗</a>
                        </div>
                    ` : ''}
                    <iframe
                        src="${url}"
                        title="${projet.title}${caption ? ' — ' + caption : ''}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen></iframe>
                `;
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
