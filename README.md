# bladebattery

An interactive, single-page explainer on the BYD Blade Battery — how it works, why it's safer, and what happens when a competitor's battery fails.

## What it covers

| Section | Description |
|---|---|
| Hero | SVG blade cell diagram with key stats (960 mm, <60 °C, 3,000+ cycles) |
| Cell size comparison | Blade vs. 18650 vs. 21700 — hover for specs |
| Cell-to-Pack (CTP) | Animated canvas showing module-based vs. BYD's no-module architecture |
| Chemistry | LFP vs. NMC bond strength, thermal stability, and runaway risk |
| Nail penetration test | Run a simulated nail-through-cell event on both battery types |
| Thermal runaway | Trigger a thermal event and watch heat spread (or not) |
| Head-to-head table | Seven key metrics: Blade vs. cylindrical cells |
| Breakthrough metrics | Animated counters: 50% density gain, 30% cost reduction, zero modules |
| Timeline | 1991 → 2022: the road from 18650 to Blade |
| EX30 / Sunwoda case file | NHTSA Recall 26V001 — failure chain from manufacturing defect to fire |
| Separator failure sequence | Step-by-step interactive canvas (7 stages, NMC vs. LFP side-by-side) |
| Temperature timeline | ISC divergence chart — how the two chemistries split after a short circuit |

## Tech

Plain HTML/CSS/JavaScript — no build step, no dependencies. Open `bladebattery/index.html` directly in a browser.

## Usage

```bash
open bladebattery/index.html   # macOS
# or just drag the file into any browser
```
