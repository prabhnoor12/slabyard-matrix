# SlabYardMatrix — 241-Page Concrete Slab, Sonotube Footing & Driveway Gravel Calculator

**SlabYardMatrix (`https://slabyardmatrix.com`)** is a zero-dependency, 241-page static HTML/CSS/Vanilla JS programmatic SEO and display-ad monetization platform for concrete slabs, monolithic thickened edges, 80 lb / 60 lb bag pallets, #4 rebar grids, Sonotube deck piers, continuous footings, and compacted driveway gravel tonnage.

## Page Inventory (241 Pre-Rendered Static HTML Pages)

| Route | Pages | Target Search Intent |
| :--- | :---: | :--- |
| `/slabs/{slug}/` | **84 Pages** | *"how many bags of concrete for 10x10 slab"*, *"yards of concrete for 24x24 garage"* |
| `/projects/{slug}/` | **52 Pages** | *"hot tub concrete pad 8x8"*, *"12x35 RV pad concrete"*, *"2-post car lift 6-inch slab"* |
| `/footings/{slug}/` | **60 Pages** | *"how many bags of concrete for 12 inch sonotube 48 inches deep"*, *"continuous strip footings"* |
| `/gravel/{slug}/` | **40 Pages** | *"tons of gravel for 12x100 driveway"*, *"#57 stone vs crusher run"* |
| `/`, `/404.html`, `/about/`, `/privacy-policy/`, `/terms/`, `/contact/` | **5 Pages** | Master Interactive Hub + AdSense Compliance Pages |

## Commands

```bash
npm run seed
npm run build
```

## Cloudflare Workers / Pages Deployment

- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy` (or publish `./dist` directly on Cloudflare Pages)
