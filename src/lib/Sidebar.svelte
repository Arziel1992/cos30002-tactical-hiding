<section class="sidebar-content">
  <header>
    <h1>Obstacle Avoidance</h1>
    <p class="tagline">Local-Space Steering &mdash; COS30002 Module 7</p>
  </header>

  <div class="md-body">

    <h2 id="theory">&#128218; Origin: Reynolds &amp; Buckland</h2>
    <p>
      Prior to Reynolds' work, collision avoidance required expensive global-space checks
      against every object in the world. By transforming the world into the
      <strong>agent's local coordinate frame</strong>, irrelevant obstacles (behind the agent)
      are discarded instantly, and complex 2D circle-intersection math collapses into a
      simple one-dimensional Pythagorean check.
    </p>
    <p>
      This algorithm is described in Reynolds' GDC 1999 paper and expanded by Mat Buckland
      in <em>Programming Game AI by Example</em> (2005). It underpins autonomous navigation
      in virtually every commercial action game released since 2000.
    </p>

    <h2 id="overview">&#128205; Local Space Concept</h2>
    <p>
      The agent becomes the <strong>origin (0, 0)</strong> of a temporary coordinate frame.
      Its heading vector becomes the positive X-axis; its side vector (perpendicular-left)
      becomes the positive Y-axis. Every nearby obstacle is re-expressed in this frame
      using <strong>dot-product projection</strong>.
    </p>
    <div class="formula-block">
      <code>local.x = dot(obstacle.pos - agent.pos, heading)</code><br />
      <code>local.y = dot(obstacle.pos - agent.pos, side)</code>
    </div>
    <ul class="formula-desc">
      <li><strong>local.x</strong>: Forward distance to the obstacle (positive = ahead)</li>
      <li><strong>local.y</strong>: Lateral offset (positive = left of heading)</li>
      <li><strong>heading</strong>: Unit vector in the agent's forward direction</li>
      <li><strong>side</strong>: Unit vector 90&deg; left of heading</li>
    </ul>

    <h2 id="phases">&#128290; The 5-Phase Algorithm</h2>

    <div class="rule-card card-blue">
      <div class="rule-icon icon-blue">1</div>
      <div class="rule-body">
        <h3 class="color-blue" id="phase1">Local Space Transform</h3>
        <p>Translate and rotate each obstacle into the agent-centric frame.
          The agent is at (0,0); heading = +X axis.</p>
      </div>
    </div>

    <div class="rule-card card-green">
      <div class="rule-icon icon-green">2</div>
      <div class="rule-body">
        <h3 class="color-green" id="phase2">Forward Culling</h3>
        <p>Any obstacle with <code>local.x &lt; 0</code> is <strong>behind</strong> the agent.
          Discard it immediately &mdash; zero further computation required.</p>
      </div>
    </div>

    <div class="rule-card card-orange">
      <div class="rule-icon icon-orange">3</div>
      <div class="rule-body">
        <h3 class="color-orange" id="phase3">Point Simplification</h3>
        <p>Expand the obstacle radius by the agent's bounding radius. This lets us
          treat the agent as a dimensionless point moving along a line, reducing the
          problem to a <strong>point-in-circle</strong> test.</p>
        <div class="formula-block">
          <code>expanded_r = obstacle.radius + agent.boundingRadius</code>
        </div>
      </div>
    </div>

    <div class="rule-card card-purple">
      <div class="rule-icon icon-purple">4</div>
      <div class="rule-body">
        <h3 class="color-purple" id="phase4">Geometric Intersection</h3>
        <p>If <code>|local.y| &lt; expanded_r</code>, a collision is guaranteed on the
          current trajectory. The exact intersection point on the local X-axis is found
          via the Pythagorean theorem:</p>
        <div class="formula-block">
          <code>intersect_x = local.x &minus; &radic;(expanded_r&sup2; &minus; local.y&sup2;)</code>
        </div>
        <ul class="formula-desc">
          <li><strong>intersect_x</strong>: The local X-coord where the agent would hit the obstacle surface</li>
          <li><strong>local.y</strong>: Lateral offset of the obstacle centre in local space</li>
        </ul>
        <p>Only the obstacle with the <strong>smallest positive</strong> intersect_x is retained
          (the most imminent threat).</p>
      </div>
    </div>

    <div class="rule-card card-red">
      <div class="rule-icon icon-red">5</div>
      <div class="rule-body">
        <h3 class="color-red" id="phase5">Force Generation</h3>
        <p>Two orthogonal local-space forces are computed, then rotated back to world space:</p>
        <div class="formula-block">
          <code>braking = (obs.radius &minus; local.x) &times; brakingWeight</code><br />
          <code>lateral = (obs.radius &minus; |local.y|) &times; lateralMult &times; sign</code><br />
          <code>world_force = toWorldSpace(braking, lateral, heading, side)</code>
        </div>
        <ul class="formula-desc">
          <li><strong>braking</strong>: Decelerates the agent (−X in local space)</li>
          <li><strong>lateral</strong>: Steers away from the obstacle's side (±Y in local space)</li>
          <li><strong>sign</strong>: +1 if obstacle is on the left (local.y &gt; 0), &minus;1 if on the right</li>
          <li><strong>world_force</strong>: The dot-product inverse transform back to global XY</li>
        </ul>
      </div>
    </div>

    <h2 id="complexity">&#9881;&#65039; Complexity</h2>
    <p>
      <strong>O(N)</strong> per agent, where N = obstacles in the detection box.
      In production, a <strong>Spatial Hash Grid</strong> or <strong>BVH</strong> reduces N
      to a small constant neighbourhood. The local-space transform itself is O(1) per obstacle
      (two dot products and a square root).
    </p>

    <h2 id="wander">&#127919; Wander &amp; Seek</h2>
    <p>
      When no target is placed, the agent uses <strong>Wander</strong>: a jitter angle
      perturbs a circle projected ahead each frame, and the agent steers toward the resulting
      circumference point &mdash; producing smooth autonomous locomotion.
    </p>
    <div class="formula-block">
      <code>circleCenter = pos + heading &times; wanderDist</code><br />
      <code>wanderPt = circleCenter + dir(angle) &times; wanderRadius</code><br />
      <code>angle += random(&minus;jitter, +jitter)</code>
    </div>
    <p>When a <strong>Target</strong> is placed, the agent uses seek:
      <code>desired = normalize(target &minus; pos) &times; maxSpeed</code>.
      Avoidance forces take priority via weighted accumulation.
    </p>

    <h2 id="games">&#127918; Game Examples</h2>
    <div class="game-cases">
      <article>
        <h4>Halo — Covenant AI</h4>
        <p>
          Bungie's Elites use local-space detection boxes scaled by their current speed.
          Fast-moving Elites scan farther ahead; crouching Elites use a tiny box,
          allowing them to duck behind cover without constant path recomputation.
        </p>
      </article>

      <article>
        <h4>F.E.A.R. — A.I. Mantling</h4>
        <p>
          Monolith's FEAR agents combine obstacle avoidance with action nodes.
          When the detection box flags an impassable obstacle, the planner switches
          from avoidance steering to a mantling animation, creating the illusion of
          deliberate tactical movement over cover.
        </p>
      </article>

      <article>
        <h4>GTA V — Traffic Simulation</h4>
        <p>
          Rockstar's vehicles run local-space avoidance on a 2D slice of the world.
          The detection box length scales with speed, so highway vehicles look far
          ahead while city drivers use shorter boxes &mdash; matching human visual
          attention distance.
        </p>
      </article>
    </div>

  </div>
</section>

<style>
  .sidebar-content { display: flex; flex-direction: column; }
</style>
