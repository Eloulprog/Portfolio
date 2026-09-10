# vendor/

Bibliothèques tierces copiées ici plutôt que chargées depuis un CDN.

Un CDN public (jsDelivr, cdnjs) reçoit l'adresse IP de chaque visiteur et la
page consultée — un transfert de données personnelles hors UE, sans base
légale ni information préalable. Les servir depuis ce domaine supprime le
transfert, et rend inutile l'attribut `integrity` puisqu'il n'y a plus de
tiers à qui faire confiance.

| Fichier | Version | Licence |
|---|---|---|
| `gsap.min.js` | GSAP 3.12.5 | [Standard "No Charge"](https://gsap.com/community/standard-license) |
| `ScrollTrigger.min.js` | GSAP 3.12.5 | idem |

Mettre à jour : télécharger la nouvelle version depuis gsap.com et remplacer
les fichiers. Aucune étape de build.
