<script>
    import { onMount } from 'svelte';
    import Canvas from './lib/Canvas.svelte';
    import Controls from './lib/Controls.svelte';
    import Glossary from './lib/Glossary.svelte';
    import Sidebar from './lib/Sidebar.svelte';
    import { TacticalHidingSim } from './lib/Simulation.js';
    import Telemetry from './lib/Telemetry.svelte';

    let simulation = new TacticalHidingSim();

    let params = $state({
        maxSpeed: 100,
        maxForce: 200,
        boundingRadius: 12,
        hidingClearance: 15,
        tacticalPenalty: 3.0,
        weightHiding: 3.0,
        weightWander: 1.0,
        obstacleRadius: 30,
        showTrail: false,
        torusMode: true,
        realisticHiding: false,
        agentVisionRadius: 400,
        hunterVisionRadius: 400,
    });

    let telemetry = $state({
        speed: 0,
        hunterSpeed: 0,
        hidingSpots: 0,
        activePhase: 0,
        obstacleCount: 0,
        hasTarget: false,
    });

    let showTrail = $state(false);
    let showHidingSpots = $state(true);
    let showSightlines = $state(true);
    let showHunterVision = $state(false);
    let showAgentVision = $state(false);
    let interactionMode = $state('select');

    let containerRef = $state();
    let leftOpen = $state(true);
    let rightOpen = $state(true);

    let glossaryOpen = $state(false);
    let glossarySection = $state('root');

    function openGlossary(section = 'root') {
        glossarySection = section;
        glossaryOpen = true;
    }

    let obstacleCount = $derived(simulation.obstacles.length);
    let hasTarget = $derived(simulation.target !== null);

    let initialised = false;

    function handleReset() {
        if (containerRef) {
            const rect = containerRef.getBoundingClientRect();
            simulation.reset(rect.width, rect.height);
        }
        interactionMode = 'select';
    }

    function handleClearObstacles() {
        simulation.clearObstacles();
    }
    function handleClearTarget() {
        simulation.clearTarget();
    }
    function handleClearEntities() {
        simulation.agents = [];
        simulation.hunters = [];
    }

    function handleKeydown(e) {
        if (e.key === 't') showTrail = !showTrail;
        if (e.key === 's') showHidingSpots = !showHidingSpots;
        if (e.key === 'v') showSightlines = !showSightlines;
        if (e.key === 'r') handleReset();
        if (e.key === 'o')
            interactionMode =
                interactionMode === 'obstacle' ? 'select' : 'obstacle';
        if (e.key === 'g')
            interactionMode =
                interactionMode === 'target' ? 'select' : 'target';
        if (e.key === 'Escape') interactionMode = 'select';
    }

    onMount(() => {
        let animationId;
        const loop = () => {
            if (containerRef && !initialised) {
                const rect = containerRef.getBoundingClientRect();
                simulation.initialise(rect.width, rect.height);
                initialised = true;
            }
            if (containerRef) {
                const rect = containerRef.getBoundingClientRect();
                simulation.update(
                    { ...params, showTrail },
                    { width: rect.width, height: rect.height },
                    telemetry,
                );
            }
            animationId = requestAnimationFrame(loop);
        };
        loop();
        window.addEventListener('keydown', handleKeydown);
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<main class="app-layout">
    {#if leftOpen}
        <aside class="sidebar-left">
            <div class="sidebar-inner">
                <Sidebar />
            </div>
            <div class="app-footer">
                Made with &#10084;&#65039; for Swinburne &mdash; COS30002
                Artificial Intelligence for Games
            </div>
        </aside>
    {/if}

    <section class="canvas-panel" bind:this={containerRef}>
        <button
            class="toggle-btn toggle-left"
            onclick={() => (leftOpen = !leftOpen)}
            aria-label="Toggle left sidebar"
        >
            {leftOpen ? '◀' : '▶'}
        </button>
        <button
            class="toggle-btn toggle-right"
            onclick={() => (rightOpen = !rightOpen)}
            aria-label="Toggle right sidebar"
        >
            {rightOpen ? '▶' : '◀'}
        </button>

        <Canvas
            {simulation}
            {params}
            {containerRef}
            bind:showTrail
            bind:showHidingSpots
            bind:showSightlines
            bind:showHunterVision
            bind:showAgentVision
            bind:interactionMode
        />

        <div
            class="mode-badge"
            class:badge-obstacle={interactionMode === 'obstacle'}
            class:badge-target={interactionMode === 'target'}
        >
            {#if interactionMode === 'obstacle'}
                Obstacle mode &mdash; click to place / remove &nbsp; [Esc] to
                exit
            {:else if interactionMode === 'target'}
                Target mode &mdash; click to place / click again to remove
                &nbsp; [Esc] to exit
            {:else}
                [T] Trail &nbsp;&middot;&nbsp; [S] Spots &nbsp;&middot;&nbsp;
                [V] Sightlines &nbsp;&middot;&nbsp; [R] Reset
                &nbsp;&middot;&nbsp; [O] Obstacle &nbsp;&middot;&nbsp; [G]
                Target
            {/if}
        </div>
    </section>

    {#if rightOpen}
        <aside class="sidebar-right">
            <div class="sidebar-inner">
                <Controls
                    bind:params
                    bind:showTrail
                    bind:showHidingSpots
                    bind:showSightlines
                    bind:showHunterVision
                    bind:showAgentVision
                    bind:interactionMode
                    onReset={handleReset}
                    onGlossary={openGlossary}
                    onClearObstacles={handleClearObstacles}
                    onClearTarget={handleClearTarget}
                    onClearEntities={handleClearEntities}
                    {obstacleCount}
                    {hasTarget}
                />
                <hr />
                <Telemetry {telemetry} />
            </div>
            <div class="app-footer">
                &copy; E. Ketterer Ortiz &mdash;
                <a
                    href="https://github.com/Arziel1992/cos30002-tactical-hiding/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color: var(--accent); text-decoration: none; font-weight: 600;"
                >
                    <svg
                        height="11"
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        version="1.1"
                        width="11"
                        style="fill: currentColor; vertical-align: middle; margin-top: -2px;"
                    >
                        <path
                            d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
                        ></path>
                    </svg> Repository
                </a>
            </div>
        </aside>
    {/if}

    <Glossary bind:isOpen={glossaryOpen} bind:section={glossarySection} />
</main>

<style>
    .toggle-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 200;
        width: 28px;
        height: 56px;
        background: var(--glass-bg);
        backdrop-filter: blur(8px);
        border: 1px solid var(--panel-border);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: var(--text-secondary);
        transition:
            background 0.2s,
            color 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .toggle-btn:hover {
        background: var(--accent);
        color: white;
    }
    .toggle-left {
        left: 0;
        border-radius: 0 8px 8px 0;
        border-left: none;
    }
    .toggle-right {
        right: 0;
        border-radius: 8px 0 0 8px;
        border-right: none;
    }

    .mode-badge {
        position: absolute;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--glass-bg);
        backdrop-filter: blur(4px);
        padding: 0.6rem 1.2rem;
        border-radius: 99px;
        font-size: 0.7rem;
        color: var(--text-secondary);
        border: 1px solid var(--panel-border);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        pointer-events: none;
        z-index: 200;
        white-space: nowrap;
    }
    .badge-obstacle {
        color: #475569;
        border-color: #94a3b8;
        background: #e2e8f0;
    }
    .badge-target {
        color: #854d0e;
        border-color: #fde047;
        background: #fef08a;
    }

    hr {
        border: 0;
        border-top: 1px solid var(--panel-border);
        margin: 1.2rem 0;
    }
</style>
