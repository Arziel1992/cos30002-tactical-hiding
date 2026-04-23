# Local Space Obstacle Avoidance (COS30002)

Interactive visualisation of Craig Reynolds' local-space obstacle avoidance algorithm for COS30002 Artificial Intelligence for Games. This tool demonstrates how modern games translate spatial geometry into agent-relative coordinates to optimize collision detection and steering behaviors.

## 🚀 Key Features

- **Svelte 5 + HTML5 Canvas:** High-performance local-space transformation visualization.
- **Five-phase Reynolds algorithm:** Detailed breakdown and execution of:
    - Phase 1: Local Space Transform
    - Phase 2: Forward Culling
    - Phase 3: Point Simplification (Expanded Bounds)
    - Phase 4: Geometric Intersection Testing
    - Phase 5: Force Generation
- **Dynamic Visual Overlays:**
    - **Detection Box:** Projected rectangular predictive vision cone ahead of the agent.
    - **Local Axes:** Heading (+X, blue) and Side (+Y, green) vector decomposition.
    - **Force Breakdown:** Visual vectors for braking (red), lateral (purple), and resultant forces (orange).
- **Behavior Blending:** Seamless toggling between Target Seek (when clicked) and Erratic Wander mode (when idle).
- **Interactive Simulation:** Click to add/remove obstacles and target nodes to test dynamic pathing real-time.

## 📐 Mathematical Models

### Local Space Transform
$$\text{local.x} = \vec{\text{heading}} \cdot (\vec{\text{obstacle}} - \vec{\text{agent}})$$
$$\text{local.y} = \vec{\text{side}} \cdot (\vec{\text{obstacle}} - \vec{\text{agent}})$$
Transforms global 2D world coordinates into the agent's relative coordinate frame.

### Geometric Intersection (Line-Circle)
$$\text{intersect\_x} = \text{local.x} - \sqrt{\text{expanded\_r}^2 - \text{local.y}^2}$$
Determines the exact point on the agent's forward axis where it penetrates the obstacle's bounding sphere, solving via the Pythagorean theorem.

### Force Generation
$$\vec{F}_{\text{brake}} = (\text{radius} - \text{local.x}) \times \text{weight}_{\text{brake}}$$
$$\vec{F}_{\text{lateral}} = (\text{radius} - |\text{local.y}|) \times \text{weight}_{\text{lat}} \times \text{sign}$$
Generates proportional push-back forces to avoid the specific intersection geometry.

## 💻 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Rendering:** HTML5 Canvas API
- **Styling:** CSS variables via Master Template (`app.css`)

## 👨‍🏫 Local Development & Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Dev Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production (Canvas RCE Deployment):**
   ```bash
   npm run build
   ```

## 📄 License

This repository is licensed under the terms described in the [LICENSE](./LICENSE) file. 

---
_Made with ❤️ for Swinburne — COS30002 Artificial Intelligence for Games — By E. Ketterer_
