# DOPE – Interactieve prototypes

Eén React-website (Vite + Tailwind CSS + React Router) met de interactieve prototypes voor de DOPE-tentoonstelling van het Wereldmuseum.

| Route     | Inhoud                                   |
|-----------|------------------------------------------|
| `#/`       | Startscherm met beide zones              |
| `#/zone-1` | Zone 1 – Behoeften · Welke behoefte zie jij? |
| `#/zone-2` | Zone 2 – Systemen · Volg het middel      |

## Lokaal starten

```bash
npm install
npm run dev      # ontwikkelserver
npm run build    # productieversie in dist/
npm run preview  # productieversie lokaal bekijken
```

## Structuur

```
src/
  App.jsx          routes en navigatie
  main.jsx         ingang van de app
  index.css        Tailwind en algemene styling
  pages/Home.jsx   startscherm
  zones/Zone1.jsx  Welke behoefte zie jij? (bestaand prototype)
  zones/zone1.css  styling Zone 1, alles onder .z1
  zones/Zone2.jsx  Volg het middel (bestaand prototype)
  zones/zone2.css  styling Zone 2, alles onder .z2
netlify.toml       build-instellingen en routing voor Netlify
public/_redirects  extra routing-vangnet voor Netlify
```

## Wat er aan de prototypes is aangepast

Alleen wat technisch nodig was:

- Beide prototypes laden React nu als module in plaats van via een CDN-script.
- De CSS van elk prototype staat onder een eigen klasse (`.z1` en `.z2`). De animaties van Zone 2 hebben het voorvoegsel `z2-`, omdat beide prototypes animaties met dezelfde naam gebruikten (`bob`, `fadeUp`).
- Zone 2 gebruikt geen Tailwind en wordt niet door Tailwind gescand. De browserstandaarden die de Tailwind-reset verandert, zijn binnen `.z2` teruggezet.
- In beide zones is een knop **Terug naar startscherm** toegevoegd. In Zone 1 staat die in de kopbalk; daarvoor is de middelste kolom van de kopbalk smaller gemaakt. In Zone 2 staat hij linksboven op het keuzescherm en onderaan in het midden tijdens de interactie.

## Publiceren

**GitHub Pages.** Het bestand `.github/workflows/deploy.yml` bouwt de site automatisch bij elke wijziging op `main`. Zet eenmalig in de repository **Settings > Pages > Source** op **GitHub Actions**.

**Netlify.** Werkt zonder extra stappen via `netlify.toml`.

De site gebruikt relatieve paden en adressen met `#` (bijvoorbeeld `.../#/zone-1`). Daardoor werkt hij ook in een submap en bij direct openen van een zone.
