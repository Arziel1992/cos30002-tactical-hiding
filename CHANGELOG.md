# Changelog

## 2026.04.23-2305

- Refactored Telemetry to display "Current Agent Behavior" instead of "Algorithm Phase"
- Implemented state-based labeling for Agent behavior: Patrol, Hiding, and Evade

## 2026.04.23-2255

- Major Refactor: Transitioned tool to **Tactical Hiding & Perception**
- Implemented Multi-Entity support for concurrent Agents and Hunters
- Added aggressive Hunter AI with **Line of Sight (LoS)** and **Memory Buffers**
- Implemented **Tactical Hiding** steering with geometric spot calculation and cognitive dot-product biasing
- Integrated Reynolds-style **Obstacle Avoidance** for all entities
- Added interactive **Vision Radius** sliders and visualization toggles
- Updated **Glossary** and **Sidebar** documentation for tactical hiding concepts
- Fixed LaTeX formula rendering in `README.md` for GitHub compatibility

## 2026.04.22-2337

- Initial release of the Local Space Obstacle Avoidance interactive tool
- Implemented Reynolds' five-phase local-space obstacle avoidance algorithm (GDC 1999 / Buckland 2005)
- `pointToLocalSpace` and `vectorToWorldSpace` dot-product transform helpers
- Single agent with wander (jittered circle projection) and seek (target placement) steering
- Detection box visualisation — turns red on active threat
- Local axes overlay showing heading (+X) and side (+Y) vectors
- Force vector decomposition: braking (red), lateral (purple), world resultant (orange)
- Phase badge in telemetry panel showing the active algorithm phase (0–5)
- Obstacle placement / removal by click; target placement / removal by click
- Keyboard shortcuts: T Trail, B Box, L Local Axes, F Forces, R Reset, O Obstacle, G Target, Esc Select
- Collapsible left/right sidebars with toggle buttons
- Glossary modal with nine entries covering local-space transform, detection box, force components, and more
- Sidebar theory covering all five algorithm phases with formula cards
- Game examples: Halo, F.E.A.R., GTA V
