<script>
let {
	isOpen = $bindable(false),
	section = $bindable("root"),
	onClose,
} = $props();

const entries = [
	{
		id: "root",
		title: "Glossary: Tactical Hiding",
		body: "Tactical hiding is an advanced steering behavior where an agent positions itself behind obstacles relative to a threat (Hunter). This tool implements geometric hiding spot calculation combined with dot-product cognitive biasing to avoid spots that are directly in the hunter's forward line of sight.",
	},
	{
		id: "interaction",
		title: "Canvas Modes",
		body: "Observe: Watch the simulation. Add Agent/Hunter: Click to place new entities. Place Obstacle: Click to add blockers (click existing to remove). Place Hunter Target: Click to set a destination for hunters to seek when they lose sight of agents.",
	},
	{
		id: "vision",
		title: "Vision & Senses",
		body: "Agents and Hunters have limited Vision Radii. A Hunter only pursues an Agent if it is within this radius and there is a clear Line of Sight (not occluded by obstacles). If a Hunter loses sight, it remembers the agent's last known position for a short duration (Memory Buffer) before returning to wander.",
	},
	{
		id: "hiding",
		title: "Hiding Spot Logic",
		body: "The simulation projects a safe 'shadow' behind every obstacle. The exact position is calculated by finding the vector from the Hunter to the obstacle and extending it by the obstacle's radius plus a 'Hiding Clearance'.",
	},
	{
		id: "penalty",
		title: "Tactical Penalty",
		body: "A cognitive bias applied to hiding spots. If a potential spot lies directly ahead of the Hunter's current velocity (high dot product), it is heavily penalised. This forces agents to choose 'smarter' hiding spots that are not only behind an obstacle but also out of the hunter's projected path.",
	},
	{
		id: "avoidance",
		title: "Obstacle Avoidance",
		body: "In addition to hiding, agents use Reynolds' obstacle avoidance to steer around blockers. This prevents the agent from running directly into the obstacle it is trying to hide behind.",
	},
	{
		id: "weights",
		title: "Behaviour Weights",
		body: "Weights determine the priority of steering forces. This simulation uses a weighted sum: Tactical Hiding (adjustable, default 3.0), Wander (adjustable, default 1.0), and a prioritized Obstacle Avoidance (fixed at 10.0 for agents and 15.0 for hunters) to ensure collision safety takes precedence over hiding.",
	},
	{
		id: "visuals",
		title: "Visualisation Overlays",
		body: "Hiding Spots: Projected coordinates behind obstacles (green is best). Sightlines: Dashed lines showing active Line of Sight. Vision Radii: Circular bounds within which entities can 'see' each other. Trail: Shows entity path history.",
	},
];

function handleClose() {
	isOpen = false;
	onClose?.();
}

function scrollToSection(id) {
	const el = document.getElementById(`glossary-${id}`);
	if (el) el.scrollIntoView({ behavior: "smooth" });
	section = id;
}

$effect(() => {
	if (isOpen && section) {
		setTimeout(() => scrollToSection(section), 10);
	}
});
</script>

{#if isOpen}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} tabindex="-1">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">
    <aside class="toc">
      <h3>Glossary</h3>
      <ul>
        {#each entries as entry}
          <li>
            <button
              class:active={section === entry.id}
              onclick={() => scrollToSection(entry.id)}
            >
              {entry.title.split(':')[1]?.trim() || entry.title}
            </button>
          </li>
        {/each}
      </ul>
      <button class="close-main-btn" onclick={handleClose}>Close Modal</button>
    </aside>

    <div class="content-view">
      {#each entries as entry}
        <section id="glossary-{entry.id}">
          <h2>{entry.title}</h2>
          <p>{entry.body}</p>
          <hr />
        </section>
      {/each}
      <div class="footer-note">Based on Reynolds GDC 1999 and Buckland — Programming Game AI by Example (2005).</div>
    </div>
  </div>
</div>
{/if}

<style>
</style>
