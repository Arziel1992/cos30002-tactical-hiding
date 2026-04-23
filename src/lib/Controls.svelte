<script>
let {
	params = $bindable(),
	showTrail = $bindable(),
	showHidingSpots = $bindable(),
	showSightlines = $bindable(),
	showHunterVision = $bindable(),
	showAgentVision = $bindable(),
	interactionMode = $bindable(),
	onReset = () => {},
	onGlossary = () => {},
	onClearObstacles = () => {},
	onClearTarget = () => {},
	onClearEntities = () => {},
	obstacleCount = 0,
	hasTarget = false,
} = $props();
</script>

<div class="controls-panel">

  <!-- ── Interaction Mode ── -->
  <header class="section-header">
    <h3>Canvas Mode</h3>
    <button class="glossary-btn" onclick={() => onGlossary('interaction')} aria-label="Open glossary for interaction modes">?</button>
  </header>
  <div class="mode-row">
    <button
      class="mode-btn"
      class:mode-active={interactionMode === 'select'}
      onclick={() => interactionMode = 'select'}
      aria-pressed={interactionMode === 'select'}
    >Observe</button>
    <button
      class="mode-btn"
      class:mode-active={interactionMode === 'agent'}
      onclick={() => interactionMode = 'agent'}
      aria-pressed={interactionMode === 'agent'}
    >Add Agent</button>
    <button
      class="mode-btn hunter-mode"
      class:mode-active={interactionMode === 'hunter'}
      onclick={() => interactionMode = 'hunter'}
      aria-pressed={interactionMode === 'hunter'}
    >Add Hunter</button>
  </div>
  <div class="mode-row" style="margin-top: 0.3rem;">
    <button
      class="mode-btn obstacle-mode"
      class:mode-active={interactionMode === 'obstacle'}
      onclick={() => interactionMode = 'obstacle'}
      aria-pressed={interactionMode === 'obstacle'}
    >Place Obstacle</button>
    <button
      class="mode-btn target-mode"
      class:mode-active={interactionMode === 'target'}
      onclick={() => interactionMode = 'target'}
      aria-pressed={interactionMode === 'target'}
    >Place Hunter Target</button>
  </div>

  {#if interactionMode === 'obstacle'}
  <div class="control-group" style="margin-top: 0.4rem;">
    <div class="label-row">
      <label for="obs-radius">Obstacle Radius (px)</label>
      <span>{params.obstacleRadius}</span>
    </div>
    <input id="obs-radius" type="range" min="12" max="80" step="4" bind:value={params.obstacleRadius}>
    <p class="hint">Click canvas to place. Click existing obstacle to remove.</p>
  </div>
  {/if}

  <div class="action-row">
    {#if obstacleCount > 0}
    <button class="clear-btn" onclick={onClearObstacles}>
      Clear {obstacleCount} Obstacle{obstacleCount > 1 ? 's' : ''}
    </button>
    {/if}
    {#if hasTarget}
    <button class="clear-btn target-clear" onclick={onClearTarget}>
      Clear Hunter Target
    </button>
    {/if}
    <button class="clear-btn" onclick={onClearEntities}>
      Clear Entities
    </button>
  </div>

  <hr />

  <!-- ── Agent Physics ── -->
  <header class="section-header">
    <h3>Agent Physics</h3>
    <button class="glossary-btn" onclick={() => onGlossary('physics')} aria-label="Open glossary for agent physics">?</button>
  </header>

  <div class="control-group">
    <div class="label-row">
      <label for="max-speed">Max Speed (px/s)</label>
      <span>{params.maxSpeed}</span>
    </div>
    <input id="max-speed" type="range" min="30" max="300" step="10" bind:value={params.maxSpeed}>
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="max-force">Max Force (turn rate)</label>
      <span>{params.maxForce}</span>
    </div>
    <input id="max-force" type="range" min="20" max="500" step="10" bind:value={params.maxForce}>
    <p class="hint">Caps steering acceleration — lower = sluggish turns.</p>
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="bounding-r">Bounding Radius (px)</label>
      <span>{params.boundingRadius}</span>
    </div>
    <input id="bounding-r" type="range" min="6" max="40" step="2" bind:value={params.boundingRadius}>
    <p class="hint">Agent body size — inflates obstacle radii during intersection check.</p>
  </div>

  <hr />

  <!-- ── Tactical Hiding Parameters ── -->
  <header class="section-header">
    <h3>Tactical Parameters</h3>
    <button class="glossary-btn" onclick={() => onGlossary('box')} aria-label="Open glossary for tactical hiding parameters">?</button>
  </header>

  <div class="control-group">
    <div class="label-row">
      <label for="hiding-clear" class="box-label">Hiding Clearance (px)</label>
      <span class="box-val">{params.hidingClearance}</span>
    </div>
    <input id="hiding-clear" type="range" min="0" max="60" step="2" bind:value={params.hidingClearance} class="box-slider">
    <p class="hint">Extra margin behind the obstacle to safely position.</p>
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="penalty-w" class="brake-label">Tactical Penalty</label>
      <span class="brake-val">{params.tacticalPenalty.toFixed(1)}</span>
    </div>
    <input id="penalty-w" type="range" min="0" max="10" step="0.5" bind:value={params.tacticalPenalty} class="brake-slider">
    <p class="hint">Multiplier penalising hiding spots aligned with Hunter's heading.</p>
  </div>

  <div class="toggle-row">
    <label class="toggle-label axes-toggle" for="chk-realistic">
      <input type="checkbox" id="chk-realistic" bind:checked={params.realisticHiding}>
      Realistic Hiding (Size Check)
    </label>
  </div>

  <hr />

  <!-- ── Vision & Senses ── -->
  <header class="section-header">
    <h3>Vision & Senses</h3>
    <button class="glossary-btn" onclick={() => onGlossary('vision')} aria-label="Open glossary for vision and senses">?</button>
  </header>

  <div class="control-group">
    <div class="label-row">
      <label for="agent-vision" style="color: #3b82f6;">Agent Vision Radius</label>
      <span style="color: #3b82f6;">{params.agentVisionRadius}</span>
    </div>
    <input id="agent-vision" type="range" min="50" max="1000" step="10" bind:value={params.agentVisionRadius} style="accent-color: #3b82f6;">
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="hunter-vision" style="color: #ef4444;">Hunter Vision Radius</label>
      <span style="color: #ef4444;">{params.hunterVisionRadius}</span>
    </div>
    <input id="hunter-vision" type="range" min="50" max="1000" step="10" bind:value={params.hunterVisionRadius} style="accent-color: #ef4444;">
  </div>

  <hr />

  <!-- ── Behaviour Weights ── -->
  <header class="section-header">
    <h3>Behaviour Weights</h3>
    <button class="glossary-btn" onclick={() => onGlossary('weights')} aria-label="Open glossary for behaviour weights">?</button>
  </header>

  <div class="control-group">
    <div class="label-row">
      <label for="w-hiding" class="avoid-label">Tactical Hiding</label>
      <span class="avoid-val">{params.weightHiding.toFixed(1)}</span>
    </div>
    <input id="w-hiding" type="range" min="0" max="10" step="0.5" bind:value={params.weightHiding} class="avoid-slider">
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="w-wander">Wander Base</label>
      <span>{params.weightWander.toFixed(1)}</span>
    </div>
    <input id="w-wander" type="range" min="0" max="3" step="0.1" bind:value={params.weightWander}>
  </div>

  <hr />

  <!-- ── Visuals ── -->
  <header class="section-header">
    <h3>Visualisation</h3>
    <button class="glossary-btn" onclick={() => onGlossary('visuals')} aria-label="Open glossary for visualisation">?</button>
  </header>

  <div class="toggle-row">
    <label class="toggle-label" for="chk-torus">
      <input type="checkbox" id="chk-torus" bind:checked={params.torusMode}>
      Torus Wrapping
    </label>
  </div>
  <div class="toggle-row">
    <label class="toggle-label" for="chk-trail">
      <input type="checkbox" id="chk-trail" bind:checked={showTrail}>
      Show Trail
    </label>
  </div>
  <div class="toggle-row">
    <label class="toggle-label box-toggle" for="chk-spots">
      <input type="checkbox" id="chk-spots" bind:checked={showHidingSpots}>
      Show Hiding Spots
    </label>
  </div>
  <div class="toggle-row">
    <label class="toggle-label force-toggle" for="chk-sightlines">
      <input type="checkbox" id="chk-sightlines" bind:checked={showSightlines}>
      Show Hunter Sightlines
    </label>
  </div>
  <div class="toggle-row">
    <label class="toggle-label" for="chk-hunter-vision" style="color: #ef4444;">
      <input type="checkbox" id="chk-hunter-vision" bind:checked={showHunterVision} style="accent-color: #ef4444;">
      Show Hunter Vision
    </label>
  </div>
  <div class="toggle-row">
    <label class="toggle-label" for="chk-agent-vision" style="color: #3b82f6;">
      <input type="checkbox" id="chk-agent-vision" bind:checked={showAgentVision} style="accent-color: #3b82f6;">
      Show Agent Vision
    </label>
  </div>

  <hr />

  <button class="reset-btn" onclick={onReset}>Reset Agent</button>
</div>

<style>
  .mode-row { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .mode-btn {
    flex: 1; min-width: 0; padding: 0.45rem 0.3rem; border-radius: 6px;
    border: 1px solid var(--panel-border); background: var(--bg-primary);
    font-size: 0.68rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
    text-align: center;
  }
  .mode-btn:hover { border-color: var(--accent); }
  .mode-btn.mode-active { background: var(--accent); color: white; border-color: var(--accent); }
  .mode-btn.obstacle-mode.mode-active { background: #64748b; border-color: #64748b; }
  .mode-btn.target-mode.mode-active { background: #ca8a04; border-color: #ca8a04; }
  .mode-btn.hunter-mode.mode-active { background: #ef4444; border-color: #ef4444; }

  .clear-btn.target-clear { border-color: rgba(202,138,4,0.4); background: rgba(202,138,4,0.08); color: #ca8a04; }
  .clear-btn.target-clear:hover { background: rgba(202,138,4,0.2); }

  .box-label, .box-val { color: #2563eb; }
  .box-slider::-webkit-slider-thumb { background: #2563eb !important; }
  .brake-label, .brake-val { color: #ef4444; }
  .brake-slider::-webkit-slider-thumb { background: #ef4444 !important; }
  .lat-label, .lat-val { color: #8b5cf6; }
  .lat-slider::-webkit-slider-thumb { background: #8b5cf6 !important; }
  .avoid-label, .avoid-val { color: #f97316; }
  .avoid-slider::-webkit-slider-thumb { background: #f97316 !important; }

  .box-toggle { color: #2563eb; }
  .box-toggle input[type="checkbox"] { accent-color: #2563eb; }
  .axes-toggle { color: #10b981; }
  .axes-toggle input[type="checkbox"] { accent-color: #10b981; }
  .force-toggle { color: #8b5cf6; }
  .force-toggle input[type="checkbox"] { accent-color: #8b5cf6; }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 0.4rem 0; }
</style>
