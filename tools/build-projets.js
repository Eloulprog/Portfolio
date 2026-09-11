/* ─────────────────────────────────────────────────────────────
   Générateur des pages projet statiques.

   Lit projects-data.js (source unique de vérité) et écrit une
   page complète par projet dans projets/<slug>.html :
   contenu, médias, embeds en chargement au clic, et toutes les
   balises SEO / Open Graph — visibles sans exécuter de JS.

   Usage :  node tools/build-projets.js
   ───────────────────────────────────────────────────────────── */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT   = path.join(__dirname, '..');
const ORIGIN = 'https://elouenlependeven.com';
const OUT    = path.join(ROOT, 'projets');

/* ── 1. charger les données (fichier navigateur, pas un module) ── */
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'projects-data.js'), 'utf8'), sandbox);
/* `const` ne devient pas une propriété du global : on relit les identifiants. */
const { PROJECTS, PROJECT_CATEGORIES } =
    vm.runInContext('({ PROJECTS, PROJECT_CATEGORIES })', sandbox);

if (!Array.isArray(PROJECTS) || !PROJECTS.length) {
    console.error('✗ PROJECTS introuvable ou vide dans projects-data.js');
    process.exit(1);
}

/* ── 2. utilitaires ── */
const esc = s => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Résumé court pour les balises meta : 155 caractères, coupé sur un mot */
const meta = s => {
    const t = String(s ?? '').replace(/\s+/g, ' ').trim();
    if (t.length <= 155) return t;
    return t.slice(0, 155).replace(/\s+\S*$/, '') + '…';
};

const catLabel = id => (PROJECT_CATEGORIES.find(c => c.id === id) || {}).label || id;

/* Chemins absolus depuis la racine : les pages vivent dans /projets/
   mais les assets à la racine, et 404.html peut être servi de partout. */
const asset = p => '/' + String(p).replace(/^\/+/, '');

/* ── 3. fragments ── */

function embedBlock(url, caption, projet) {
    const isFigma   = /figma\.com/.test(url);
    const isYoutube = /youtube\.com|youtu\.be/.test(url);
    const label = isFigma ? 'Charger le prototype'
                : isYoutube ? 'Lire la vidéo'
                : 'Charger le contenu';

    const chrome = isFigma ? `
                    <div class="figma-chrome">
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-dot"></span>
                        <span class="figma-chrome-label">Prototype Figma</span>
                        <a class="figma-chrome-expand" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir en plein écran">↗</a>
                    </div>` : '';

    /* Le poster occupe déjà la taille finale : pas de décalage au chargement.
       L'iframe (cookies tiers) n'est injectée qu'au clic. */
    const poster = projet.image
        ? `<img class="embed-poster-img" src="${asset(projet.image)}" alt="" width="1200" height="675" loading="lazy" decoding="async">`
        : '';

    return `
                <div class="projet-visual-inner projet-visual-video${isFigma ? ' projet-visual-figma' : ''}">${chrome}
                    <button class="embed-poster" type="button" data-embed="${esc(url)}"
                            data-title="${esc(projet.title + (caption ? ' — ' + caption : ''))}"
                            aria-label="${esc(label)}">
                        ${poster}
                        <span class="embed-poster-cta">
                            <span class="embed-poster-icon" aria-hidden="true">${isYoutube ? '▶' : '↗'}</span>
                            ${esc(label)}
                        </span>
                        <span class="embed-poster-hint">Contenu externe chargé au clic</span>
                    </button>
                </div>${caption ? `
                <p class="projet-visual-caption">${esc(caption)}</p>` : ''}`;
}

function visualBlock(p) {
    const videos = p.videos || (p.video ? [{ url: p.video }] : []);
    if (videos.length) {
        return videos.map(v =>
            embedBlock(typeof v === 'string' ? v : v.url,
                       (typeof v === 'object' && v.label) ? v.label : '', p)
        ).join('\n');
    }
    if (p.image) {
        return `
                <div class="projet-visual-inner">
                    <img src="${asset(p.image)}" alt="${esc('Aperçu du projet ' + p.title)}"
                         width="1200" height="675" loading="lazy" decoding="async"
                         style="width:100%;height:100%;object-fit:cover;display:block">
                </div>`;
    }
    return `
                <div class="projet-visual-inner ${esc(p.thumb || '')}"></div>`;
}

const linksBlock = p => (!p.links || !p.links.length) ? '' : `
            <div class="projet-links">
${p.links.map(l => `                <a class="projet-link-btn" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('\n')}
            </div>`;

const featBlock = p => (!p.feat || !p.feat.length) ? '' : `
                <div class="projet-aside-block reveal d3">
                    <div class="projet-aside-label">Feat</div>
                    <div class="projet-feat">
${p.feat.map(f => `                        <a class="projet-feat-link" href="${esc(f.href)}" target="_blank" rel="noopener noreferrer">${esc(f.name)} <span aria-hidden="true">↗</span></a>`).join('\n')}
                    </div>
                </div>`;

/* JSON-LD : décrit le projet comme une œuvre créative rattachée à son auteur */
function jsonLd(p, url) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.title,
        description: meta(p.summary),
        url,
        dateCreated: p.date || undefined,
        author: { '@type': 'Person', name: 'Elouen Le Pendeven', url: ORIGIN + '/' },
        keywords: (p.tags || []).join(', '),
        image: p.image ? ORIGIN + asset(p.image) : undefined,
    }, null, 2).replace(/</g, '\\u003c');
}

/* ── 4. gabarit ── */
function page(p, prev, next) {
    const url  = `${ORIGIN}/projets/${p.slug}.html`;
    const desc = meta(p.summary);
    const cats = (p.category || []).filter(id => id !== 'iut');

    return `<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(p.title)} — Elouen Le Pendeven</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="author" content="Elouen Le Pendeven">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#0A2A33">
    <link rel="canonical" href="${url}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Elouen Le Pendeven">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(p.title)} — Elouen Le Pendeven">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${ORIGIN}/Images/og-cover.jpg">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="2400">
    <meta property="og:image:height" content="1254">
    <meta property="og:image:alt" content="Elouen Le Pendeven — Portfolio : communication, audiovisuel, graphisme, web / UI-UX">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(p.title)} — Elouen Le Pendeven">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${ORIGIN}/Images/og-cover.jpg">
    <meta name="twitter:image:alt" content="Elouen Le Pendeven — Portfolio : communication, audiovisuel, graphisme, web / UI-UX">

    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="stylesheet" href="/fonts/fonts.css">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/projet.css">

    <script type="application/ld+json">
${jsonLd(p, url)}
    </script>
</head>

<body class="projet-page">

<!-- NAV -->
<nav id="nav">
    <div class="wrap">
        <div class="nav-inner">
            <a href="/" class="nav-logo">
                <span class="nav-logo-dot" aria-hidden="true"></span>
                Elouen Le Pendeven
            </a>
            <ul class="nav-links">
                <li><a href="/#about">Qui suis-je</a></li>
                <li><a href="/#competences">Compétences</a></li>
                <li><a href="/#projets">Projets</a></li>
                <li><a href="/#parcours">Parcours</a></li>
            </ul>
            <a href="/#contact" class="nav-cta">Contact</a>
            <button class="nav-burger" id="nav-burger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>

<!-- Menu mobile -->
<div class="nav-mobile" id="nav-mobile">
    <a href="/#about">Qui suis-je</a>
    <a href="/#competences">Compétences</a>
    <a href="/#projets">Projets</a>
    <a href="/#parcours">Parcours</a>
    <a href="/#contact">Contact</a>
</div>

<!-- HEADER PROJET -->
<header class="projet-header">
    <div class="projet-header-bg" aria-hidden="true"></div>
    <div class="wrap">
        <div class="projet-header-content">
            <a href="/#projets" class="projet-back">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
                Retour aux projets
            </a>
            <div class="projet-meta">
                <div class="projet-tags">
${(p.tags || []).map(t => `                    <span class="projet-tag">${esc(t)}</span>`).join('\n')}
                </div>
                <span class="projet-date">${esc(p.date || '')}</span>
            </div>
            <h1 class="projet-title">${esc(p.title)}</h1>
            <p class="projet-summary">${esc(p.summary)}</p>
        </div>
    </div>
</header>

<!-- CORPS DU PROJET -->
<main class="projet-main">
    <div class="wrap">
        <div class="projet-body">

            <aside class="projet-sidebar">
                <div class="projet-aside-block">
                    <div class="projet-aside-label">Outils utilisés</div>
                    <div class="projet-tools">
${(p.tools || []).map(t => `                        <span class="projet-tool-chip">${esc(t)}</span>`).join('\n')}
                    </div>
                </div>${cats.length ? `
                <div class="projet-aside-block">
                    <div class="projet-aside-label">Catégorie</div>
                    <div class="projet-cat">
${cats.map(id => `                        <span class="projet-cat-chip">${esc(catLabel(id))}</span>`).join('\n')}
                    </div>
                </div>` : ''}
                <div class="projet-aside-block">
                    <div class="projet-aside-label">Statut</div>
                    <div class="projet-stat-val">${esc(p.status || '—')}</div>
                </div>${p.label ? `
                <div class="projet-aside-block">
                    <div class="projet-aside-label">Contexte</div>
                    <div class="projet-label-val">${esc(p.label)}</div>
                </div>` : ''}${featBlock(p)}
                <div class="projet-nav-links">
${prev ? `                    <a href="/projets/${prev.slug}.html" class="btn btn-primary btn-sm" rel="prev">← Précédent</a>` : ''}
${next ? `                    <a href="/projets/${next.slug}.html" class="btn btn-outline btn-sm" rel="next">Suivant →</a>` : ''}
                </div>
            </aside>

            <article class="projet-article">

                <section class="projet-section">
                    <div class="projet-section-num">01</div>
                    <div class="projet-section-body">
                        <h2 class="projet-section-title">Mais c'est quoi ce projet ?</h2>
                        <div class="projet-section-text"><p>${esc(p.summary)}</p></div>
                    </div>
                </section>

                <div class="projet-visual">${visualBlock(p)}
                </div>${linksBlock(p)}

                <section class="projet-section">
                    <div class="projet-section-num">02</div>
                    <div class="projet-section-body">
                        <h2 class="projet-section-title">Mon rôle</h2>
                        <div class="projet-section-text"><p>${esc(p.role)}</p></div>
                    </div>
                </section>

                <section class="projet-section">
                    <div class="projet-section-num">03</div>
                    <div class="projet-section-body">
                        <h2 class="projet-section-title">Processus</h2>
                        <div class="projet-section-text"><p>${esc(p.process)}</p></div>
                    </div>
                </section>

                <section class="projet-section">
                    <div class="projet-section-num">04</div>
                    <div class="projet-section-body">
                        <h2 class="projet-section-title">Résultat &amp; outils</h2>
                        <div class="projet-section-text"><p>${esc(p.result)}</p></div>
                        <div class="projet-tools-list">
${(p.tools || []).map(t => `                            <span class="projet-tool-badge">${esc(t)}</span>`).join('\n')}
                        </div>
                    </div>
                </section>

            </article>
        </div>
    </div>

    <div class="projet-cta-strip">
        <div class="wrap">
            <p class="projet-cta-label">Intéressé par ce travail ?</p>
            <h2 class="projet-cta-title">Discutons de <span class="hw">votre projet.</span></h2>
            <div>
                <a href="/#contact" class="btn btn-mint">Me contacter</a>
                <a href="/#projets" class="btn btn-ghost-dark">Voir tous les projets</a>
            </div>
        </div>
    </div>
</main>

<footer>
    <div class="wrap">
        <div class="foot-in">
            <span class="foot-logo">
                <span class="foot-logo-dot" aria-hidden="true"></span>
                Elouen Le Pendeven
            </span>
            <span class="foot-copy">© 2026 — Design &amp; Création</span>
            <ul class="foot-links">
                <li><a href="mailto:elouen.lependeven.pro@gmail.com">Email</a></li>
                <li><a href="/CV_Elouen_Le_Pendeven.pdf" download>CV</a></li>
                <li><a href="/mentions-legales.html">Mentions légales</a></li>
                <li><a href="/confidentialite.html">Confidentialité</a></li>
            </ul>
        </div>
    </div>
</footer>

<script>
/* Chargement au clic des contenus externes (YouTube, Figma) :
   aucune requête ni cookie tiers tant que le visiteur n'a pas cliqué. */
document.querySelectorAll('.embed-poster').forEach(function (poster) {
    poster.addEventListener('click', function () {
        var url = poster.dataset.embed;
        if (/youtube\\.com|youtu\\.be/.test(url)) url += (url.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
        var f = document.createElement('iframe');
        f.src = url;
        f.title = poster.dataset.title;
        f.loading = 'lazy';
        f.setAttribute('frameborder', '0');
        f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        f.allowFullscreen = true;
        poster.replaceWith(f);
    });
});
</script>
<script src="/script.js"></script>
</body>

</html>
`;
}

/* ── 5. écriture ── */
let written = 0, skipped = 0;
PROJECTS.forEach((p, i) => {
    /* Pages rédigées à la main : on n'y touche pas.
       La navigation précédent/suivant continue de pointer dessus. */
    if (p.external) {
        console.log(`  · projets/${p.slug}.html`.padEnd(42) + 'page manuelle — ignorée');
        skipped++;
        return;
    }
    const file = path.join(OUT, p.slug + '.html');
    fs.writeFileSync(file, page(p, PROJECTS[i - 1], PROJECTS[i + 1]), 'utf8');
    const embeds = (p.videos || (p.video ? [1] : [])).length;
    console.log(`  ✓ projets/${p.slug}.html`.padEnd(42)
        + `${(p.tools || []).length} outils · ${embeds} embed(s)`
        + (p.image ? ' · visuel' : ''));
    written++;
});
console.log(`\n${written} page(s) générée(s), ${skipped} page(s) manuelle(s) préservée(s).`);
