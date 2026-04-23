<script>
let { telemetry } = $props();

const phaseLabels = {
	0: "Patrol / Wander",
	1: "Tactical Hiding (Arrive)",
	2: "Emergency Evade (Panic)"
};

const phaseColors = {
	0: "#10b981",
	1: "#3b82f6",
	2: "#ef4444"
};
</script>

<div class="telemetry-panel">
  <div class="telem-header">Live Telemetry</div>
  <div class="telem-grid">
    <div class="telem-item">
      <span class="label">Agent Speed</span>
      <span class="value mono">{telemetry.speed.toFixed(1)} px/s</span>
    </div>
    <div class="telem-item">
      <span class="label">Hunter Speed</span>
      <span class="value mono">{telemetry.hunterSpeed.toFixed(1)} px/s</span>
    </div>
    <div class="telem-item">
      <span class="label">Hiding Spots Analyzed</span>
      <span class="value mono">{telemetry.hidingSpots}</span>
    </div>
    <div class="telem-item">
      <span class="label">Obstacles</span>
      <span class="value accent">{telemetry.obstacleCount}</span>
    </div>
  </div>

  <div class="telem-header" style="margin-top: 1rem;">Current Agent Behavior</div>
  <div class="phase-badge" style="background: {phaseColors[telemetry.activePhase] || '#333'}22; border-color: {phaseColors[telemetry.activePhase] || '#333'}66; color: {phaseColors[telemetry.activePhase] || '#333'}">
    {phaseLabels[telemetry.activePhase] ?? phaseLabels[0]}
  </div>
</div>

<style>
  .telemetry-panel {
    background: var(--bg-primary); border: 1px solid var(--panel-border);
    border-radius: 12px; padding: 1.2rem;
  }
  .telem-header {
    font-size: 0.7rem; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 1.5px;
    margin-bottom: 0.8rem; border-bottom: 1px solid var(--panel-border);
    padding-bottom: 0.4rem; font-weight: 700;
  }
  .telem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 0.6rem; }
  .telem-item { display: flex; flex-direction: column; gap: 0.15rem; }
  .label { font-size: 0.65rem; color: var(--text-secondary); font-weight: 500; }
  .value { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
  .accent { color: var(--accent); }
  .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }

  .phase-badge {
    padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid;
    font-size: 0.72rem; font-weight: 700; transition: all 0.2s;
  }
</style>
