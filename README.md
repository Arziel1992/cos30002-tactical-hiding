# Tactical Hiding & Perception (COS30002)

Interactive educational simulation demonstrating tactical hiding behaviors, line-of-sight perception, and cognitive biasing for COS30002 Artificial Intelligence for Games. This tool explores how autonomous agents can utilize environmental geometry to evade threats by calculating optimal hiding spots and managing sensory memory.

## 🚀 Key Features

- **Geometric Hiding Logic:** Real-time calculation of optimal "shadow" positions behind obstacles relative to dynamic hunters.
- **Cognitive Dot-Product Biasing:** Implements tactical penalties for hiding spots that lie directly in a hunter's forward heading, forcing agents to find "smarter" cover.
- **Advanced Perception System:** Implements finite Line of Sight (LoS) with geometric occlusion—hunters can only pursue agents they can physically see.
- **Temporal Memory Buffer:** Hunters retain the "last known position" of hidden agents, allowing for realistic investigation behaviors before returning to patrol.
- **Kinematic Size Check:** Optional realistic occlusion toggle that validates if an obstacle is physically large enough to cover the agent's bounding radius.
- **Multi-Entity Sandbox:** Interactive mode for placing multiple agents, aggressive hunters, and obstacles to test complex emergence.

## 📐 Mathematical Models

### Hiding Spot Calculation
$$P_{spot} = P_{obs} + \vec{n}_{h \to o} \times (r_{obs} + r_{agent} + k_{clear})$$
Calculates the optimal coordinate behind an obstacle by projecting along the normal vector from the hunter to the obstacle center, adjusted for physical radii and safety clearance.

### Tactical Dot-Product Penalty
$$D_{biased} = D_{agent \to spot} \times (1 + \max(0, \vec{v}_{h \to spot} \cdot \vec{v}_{h_{heading}}) \times w_{penalty})$$
Penalizes hiding spots that are directly in the hunter's field of view. This biasing ensures agents prioritize spots that are tactically sound rather than just geographically close.

### Line of Sight (LoS) Occlusion
$$dist(P_{obs}, \overline{P_{observer}P_{target}}) < r_{obs}$$
A segment-to-point distance test used to determine if an obstacle intersects the vision ray between two entities, enabling realistic sensory occlusion.

## 💻 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Rendering:** HTML5 Canvas API
- **Styling:** Vanilla CSS + Svelte Transitions

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
