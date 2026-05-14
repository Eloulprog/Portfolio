# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Portfolio personnel statique d'Elouen Le Pendeven — publié sur GitHub Pages à `elouenlependeven.com` (CNAME configuré).

Pas de build system, pas de bundler, pas de dépendances npm. Tout est du HTML/CSS/JS vanilla servi directement.

## Déploiement

Push sur `main` → GitHub Pages publie automatiquement la racine du dépôt. Il n'y a pas de workflow CI — le déploiement est immédiat.

Pour tester localement, ouvrir directement les fichiers HTML dans un navigateur ou utiliser un serveur statique simple :
```
python3 -m http.server 8000
```

## Architecture du projet

Il y a deux versions du site en parallèle :

### Version live (racine)
- `index.html` — page "en construction" actuellement en production
- `index-dev.html` + `style.css` + `animations.js` — vraie home de travail (non publiée comme index)
- `projets/` — pages de projets individuels avec `projects-common.css` et `projects.js` partagés
- `index-studio.html` + `style-studio.css` + `studio.js` — variante "studio" expérimentale

### Version NEW (refonte en cours)
- `NEW/index.html` + `NEW/style.css` + `NEW/script.js` — **refonte principale active**

La refonte `NEW/` est la version sur laquelle tout le travail de DA se fait. Elle n'est pas encore mise en production (pas liée depuis `index.html`).

## Design system — NEW/

**Palette (dark editorial)**
- `--ink: #0C0C0C` — fond principal
- `--paper: #F2EFE9` — texte et fonds clairs
- `--acid: #A855F7` — couleur d'accent (violet)
- `--acid-dim: #7C3AED` — violet foncé (hover, about-left)

**Typographies Google Fonts**
- `Syne 600/700/800` — titres structurels, nav, labels
- `Caveat 500/600/700` — accents manuscrits (`.hw` dans les titres)
- `Inter 400/500/600` — corps de texte

**Conventions CSS**
- Classes `.dual-title` + `.hw` pour la double typographie Syne+Caveat sur les titres de section
- Classes `.reveal` / `.reveal-left` + `.d1`–`.d4` pour les animations scroll (IntersectionObserver dans `script.js`)
- Sections alternées : fond `var(--ink)` (défaut), `.light` = `var(--paper)`, `.mid` = `var(--ink-mid)`

## Assets

- `Images/Photo_CV2.png` — photo portrait principale, utilisée dans le hero de `NEW/`
- Référencée depuis `NEW/` avec le chemin `../Images/Photo_CV2.png`
- `CV_Elouen_Le_Pendeven.pdf` — CV en racine (lié depuis la nav et les boutons)
- Le fichier vidéo `English/LePendeven_Lallauret_Omnes_LindorVF.mp4` est exclu du dépôt (trop lourd pour GitHub)

## Contact

`elouen.lependeven.pro@gmail.com`
