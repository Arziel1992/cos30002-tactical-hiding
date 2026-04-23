<section class="sidebar-content">
  <header>
    <h1>Tactical Hiding</h1>
    <p class="tagline">Perception &amp; Cover &mdash; COS30002 Module 7</p>
  </header>

  <div class="md-body">

    <h2 id="theory">&#128218; Theory: Hiding &amp; Cover</h2>
    <p>
      Tactical hiding is a complex steering behavior where an agent analyzes its environment
      to find positions that provide <strong>visual occlusion</strong> from a threat.
      Unlike simple avoidance, hiding requires an awareness of the <strong>Hunter's position</strong>
      relative to environmental obstacles.
    </p>
    <p>
      This simulation combines <strong>geometric spot calculation</strong> with <strong>cognitive biasing</strong>
      to select spots that are not only physically safe but also tactically advantageous.
    </p>

    <h2 id="hiding">&#128205; Hiding Spot Projection</h2>
    <p>
      For every obstacle, a potential hiding spot is projected along the vector originating
      at the Hunter and passing through the obstacle's center.
    </p>
    <div class="formula-block">
      <code>dirFromHunter = normalize(obstacle.pos - hunter.pos)</code><br />
      <code>dist = obstacle.radius + agent.boundingRadius + clearance</code><br />
      <code>spotPos = obstacle.pos + (dirFromHunter * dist)</code>
    </div>
    <ul class="formula-desc">
      <li><strong>clearance</strong>: Extra margin to ensure the agent is fully occluded</li>
      <li><strong>agent.boundingRadius</strong>: Inflates the obstacle to treat the agent as a point</li>
    </ul>

    <h2 id="biasing">&#128373;&#65039; Cognitive Dot-Product Biasing</h2>
    <p>
      Not all hiding spots are equal. A spot that is physically behind an obstacle but
      lies directly in the Hunter's <strong>forward heading</strong> is high-risk.
      We apply a <strong>Tactical Penalty</strong> using the dot product:
    </p>
    <div class="formula-block">
      <code>alignment = dot(dirToSpotFromHunter, hunter.heading)</code><br />
      <code>if (alignment > 0) penalty = 1.0 + (alignment * weight)</code>
    </div>
    <p>
      This forces the agent to favor spots that are "off-axis" from the hunter's gaze,
      simulating a primitive tactical intelligence.
    </p>

    <h2 id="perception">&#128065;&#65039; Perception &amp; LoS</h2>

    <div class="rule-card card-blue">
      <div class="rule-icon icon-blue">1</div>
      <div class="rule-body">
        <h3 class="color-blue" id="percept1">Line of Sight (LoS)</h3>
        <p>Entities use ray-casting to detect occlusion. If an obstacle's radius
          intersects the vision ray, LoS is broken and the target is "lost".</p>
      </div>
    </div>

    <div class="rule-card card-green">
      <div class="rule-icon icon-green">2</div>
      <div class="rule-body">
        <h3 class="color-green" id="percept2">Vision Radius</h3>
        <p>Sensory range is finite. Agents and Hunters only acknowledge each other
          if they fall within their respective <strong>Vision Radii</strong>.</p>
      </div>
    </div>

    <div class="rule-card card-orange">
      <div class="rule-icon icon-orange">3</div>
      <div class="rule-body">
        <h3 class="color-orange" id="percept3">Memory Buffer</h3>
        <p>Hunters store the <code>lastSeenTargetPos</code>. When LoS is broken, the hunter
          switches from <strong>Pursuit</strong> to <strong>Investigation</strong>, moving to the last
          known coordinate before returning to a patrol state.</p>
      </div>
    </div>

    <h2 id="avoidance">&#9881;&#65039; Integrated Avoidance</h2>
    <p>
      To ensure the agent doesn't collide with the very obstacle it is trying to hide behind,
      <strong>Reynolds' Obstacle Avoidance</strong> is blended into the final steering vector.
      This provides a layer of physical navigation beneath the tactical decision-making.
    </p>

    <h2 id="games">&#127918; Game Examples</h2>
    <div class="game-cases">
      <article>
        <h4>Metal Gear Solid — Guard AI</h4>
        <p>
          MGS guards use vision cones and LoS checks. When a player hides, guards
          move to the "last known position" (Investigation) and scan nearby
          obstacles—directly utilizing sensory memory buffers.
        </p>
      </article>

      <article>
        <h4>The Last of Us — Dynamic Cover</h4>
        <p>
          Naughty Dog's AI evaluates environmental geometry to find cover spots
          relative to the player's weapon aim vector, effectively using dot-product
          biasing to avoid cover that is easily flanked.
        </p>
      </article>

      <article>
        <h4>Alien: Isolation — The Xeno</h4>
        <p>
          The Alien uses complex "Director" logic to feed its sensory systems hints.
          It combines physical LoS checks with search patterns centered on the player's
          most recent high-noise or visible location.
        </p>
      </article>
    </div>

  </div>
</section>

<style>
  .sidebar-content { display: flex; flex-direction: column; }
</style>
