<script>
let {
	isOpen = $bindable(false),
	section = $bindable("root"),
	onClose,
} = $props();

const entries = [
	{
		id: "root",
		title: "Glossary: Obstacle Avoidance",
		body: "Reynolds' local-space obstacle avoidance transforms the world into the agent's own coordinate frame, enabling O(N) per-obstacle intersection tests and trivial culling of obstacles behind the agent. The five-phase algorithm is the foundation of autonomous vehicle and character navigation in nearly every modern game engine.",
	},
	{
		id: "interaction",
		title: "Canvas Modes",
		body: "Observe mode: watch the agent wander and avoid. Place Obstacle: click to add a circular blocker; click an existing obstacle to remove it. Place Target: click to set a seek destination; avoidance forces still apply while seeking. Click the target marker again to remove it.",
	},
	{
		id: "physics",
		title: "Agent Physics",
		body: "Max Speed caps the velocity vector length in pixels per second. Max Force caps the steering force magnitude applied each frame, acting as the agent's inertia or turn rate. Lower Max Force produces wide, sluggish curves; higher values produce sharp responsive turns.",
	},
	{
		id: "box",
		title: "Detection Box",
		body: "A rectangle projected ahead of the agent in its local coordinate frame. Its width equals twice the agent's bounding radius plus a small margin. Its length (tuneable) determines the lookahead distance. Only obstacles that overlap this box are considered in the avoidance computation.",
	},
	{
		id: "forces",
		title: "Avoidance Force Components",
		body: "The algorithm generates two orthogonal forces in local space: Braking (−X) decelerates the agent as the obstacle approaches along the forward axis; Lateral (±Y) steers the agent sideways away from the obstacle's centre. These are then rotated back to world space via inverse dot-product projection.",
	},
	{
		id: "weights",
		title: "Behaviour Weights",
		body: "All steering forces (avoidance, seek, wander) are scaled by their weight before summation. A high Avoidance weight means the agent will swerve hard and early. A high Seek weight pulls the agent strongly toward a target. When weights conflict, the agent steers along the resultant vector.",
	},
	{
		id: "visuals",
		title: "Visualisation Overlays",
		body: "Trail shows the agent's path history. Detection Box draws the forward rectangle — it turns red when a threat is detected. Local Axes shows the heading (+X, blue) and side (+Y, green) vectors at the agent's current position. Force Vectors renders the braking (red), lateral (purple), and world-space resultant (orange) steering arrows.",
	},
	{
		id: "localspace",
		title: "Local Space Transformation",
		body: "A change-of-basis operation that makes the agent the coordinate origin (0,0), with its forward heading as the +X axis and its perpendicular-left vector as the +Y axis. Every point is re-expressed via two dot products against heading and side. This collapses 2D intersection math into trivial one-dimensional comparisons.",
	},
	{
		id: "bounding",
		title: "Bounding Radius",
		body: "The circular approximation of the agent's body. During Phase 3, this is added to each obstacle's radius, inflating the obstacle into an expanded circle. The agent is then treated as a dimensionless point — simplifying the geometric intersection from an area test to a point-distance test.",
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
