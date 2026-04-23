// ─── Vector Utilities ───────────────────────────────────────────────────────

export function magnitude(v) {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalise(v) {
	const m = magnitude(v);
	if (m < 1e-9) return { x: 0, y: 0 };
	return { x: v.x / m, y: v.y / m };
}

function truncate(v, max) {
	const m = magnitude(v);
	if (m <= max) return v;
	const s = max / m;
	return { x: v.x * s, y: v.y * s };
}

function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
function scale(v, s) { return { x: v.x * s, y: v.y * s }; }
function dot(a, b) { return a.x * b.x + a.y * b.y; }

function distToSegmentSquared(p, v, w) {
	const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
	if (l2 === 0) return (p.x - v.x) * (p.x - v.x) + (p.y - v.y) * (p.y - v.y);
	let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	t = Math.max(0, Math.min(1, t));
	return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
}

export function hasLineOfSight(posA, posB, obstacles, visionRadius = Infinity) {
	const d = magnitude(sub(posA, posB));
	if (d > visionRadius) return false;

	for (const obs of obstacles) {
		const distSq = distToSegmentSquared(obs.position, posA, posB);
		if (distSq < obs.radius * obs.radius) {
			return false;
		}
	}
	return true;
}

// ─── Local-Space Transform Helpers ──────────────────────────────────────────

/**
 * Transform a world-space point into the agent's local coordinate frame.
 * Agent is at origin (0,0); heading = +X axis; side = +Y axis.
 */
export function pointToLocalSpace(worldPoint, agentPos, heading, side) {
	const delta = sub(worldPoint, agentPos);
	return {
		x: dot(delta, heading),
		y: dot(delta, side),
	};
}

/**
 * Transform a local-space vector back into world space.
 */
export function vectorToWorldSpace(localVec, heading, side) {
	return {
		x: localVec.x * heading.x + localVec.y * side.x,
		y: localVec.x * heading.y + localVec.y * side.y,
	};
}

// ─── Steering Behaviours ─────────────────────────────────────────────────────

export function calculateObstacleAvoidance(agent, obstacles, boxLen, params) {
	const boundingRadius = params.boundingRadius ?? 12;
	const brakingWeight = params.brakingWeight ?? 0.2;
	const lateralMultiplier = params.lateralMultiplier ?? 12.0;

	const heading = normalise(agent.velocity);
	const side = { x: -heading.y, y: heading.x };

	let closestDist = Number.POSITIVE_INFINITY;
	let closestObs = null;
	let closestLocal = null;

	for (const obs of obstacles) {
		const local = pointToLocalSpace(obs.position, agent.position, heading, side);

		if (local.x < 0) continue;
		if (local.x > boxLen + obs.radius + boundingRadius) continue;

		const expandedRadius = obs.radius + boundingRadius;
		if (Math.abs(local.y) >= expandedRadius) continue;

		const intersectX = local.x - Math.sqrt(expandedRadius * expandedRadius - local.y * local.y);

		if (intersectX < closestDist) {
			closestDist = intersectX;
			closestObs = obs;
			closestLocal = local;
		}
	}

	if (!closestObs) return { x: 0, y: 0 };

	const expandedRadius = closestObs.radius + boundingRadius;
	const brakingMag = (expandedRadius - closestLocal.x) * brakingWeight;
	const lateralSign = closestLocal.y < 0 ? 1 : -1;
	const lateralMag = (expandedRadius - Math.abs(closestLocal.y)) * lateralMultiplier * lateralSign;

	return vectorToWorldSpace({ x: Math.abs(brakingMag), y: Math.abs(lateralMag) * lateralSign }, heading, side);
}

export function calculateArrive(position, target, velocity, maxSpeed, deceleration = 0.3) {
	const delta = sub(target, position);
	const dist = magnitude(delta);
	if (dist > 0) {
		// Speed based on deceleration parameter
		let speed = dist / deceleration;
		speed = Math.min(speed, maxSpeed);
		const desired = scale(delta, speed / dist);
		return sub(desired, velocity);
	}
	return { x: 0, y: 0 };
}

export function calculateEvade(agentPos, hunterPos, velocity, maxSpeed) {
	const delta = sub(agentPos, hunterPos);
	const desired = scale(normalise(delta), maxSpeed);
	return sub(desired, velocity);
}

/**
 * Tactical Hiding logic (Pseudo 02)
 */
export function calculateTacticalHiding(agent, hunter, obstacles, params) {
	let bestHidingSpot = null;
	let closestBiasedDist = Number.POSITIVE_INFINITY;
	let debugSpots = [];

	// 1. Memory buffer could be implemented here. For simplicity we assume constant update
	
	const clearance = params.hidingClearance ?? 15;
	const penaltyWeight = params.tacticalPenalty ?? 3.0;

	for (const obs of obstacles) {
		// Realistic hiding: Skip if obstacle is too small to cover the agent
		if (params.realisticHiding && obs.radius < agent.boundingRadius) {
			continue;
		}

		let dirFromHunter = sub(obs.position, hunter.position);
		let distFromHunter = magnitude(dirFromHunter);
		if (distFromHunter < 1e-5) continue;
		dirFromHunter = scale(dirFromHunter, 1 / distFromHunter);

		const safeDistance = obs.radius + agent.boundingRadius + clearance;
		const potentialHidingSpot = add(obs.position, scale(dirFromHunter, safeDistance));

		const distToSpot = magnitude(sub(agent.position, potentialHidingSpot));

		// Cognitive Dot Product Biasing
		let dirToSpotFromHunter = sub(potentialHidingSpot, hunter.position);
		let distToSpotFromHunter = magnitude(dirToSpotFromHunter);
		if (distToSpotFromHunter > 1e-5) {
			dirToSpotFromHunter = scale(dirToSpotFromHunter, 1 / distToSpotFromHunter);
		} else {
			dirToSpotFromHunter = dirFromHunter;
		}

		const hunterHeading = normalise(hunter.velocity);
		const alignmentDot = dot(dirToSpotFromHunter, hunterHeading);

		let penaltyMultiplier = 1.0;
		if (alignmentDot > 0) {
			penaltyMultiplier = 1.0 + (alignmentDot * penaltyWeight);
		}

		const finalBiasedDist = distToSpot * penaltyMultiplier;

		debugSpots.push({
			position: potentialHidingSpot,
			biasedDist: finalBiasedDist,
			obstacle: obs
		});

		if (finalBiasedDist < closestBiasedDist) {
			closestBiasedDist = finalBiasedDist;
			bestHidingSpot = potentialHidingSpot;
		}
	}

	const debug = {
		bestHidingSpot,
		debugSpots,
		phase: bestHidingSpot ? 1 : 2 // 1 = Hiding, 2 = Evading
	};

	if (bestHidingSpot) {
		agent.lastHidingSpot = bestHidingSpot;
		return { force: calculateArrive(agent.position, bestHidingSpot, agent.velocity, agent.maxSpeed), debug };
	}

	return { force: calculateEvade(agent.position, hunter.position, agent.velocity, agent.maxSpeed), debug };
}

export function resolveCollisions(entity, obstacles) {
	for (const obs of obstacles) {
		const delta = sub(entity.position, obs.position);
		const dist = magnitude(delta);
		const minDist = obs.radius + entity.boundingRadius;
		if (dist < minDist && dist > 1e-5) {
			const pushDist = minDist - dist;
			const pushDir = scale(delta, 1 / dist);
			entity.position = add(entity.position, scale(pushDir, pushDist));
		}
	}
}

/**
 * Seek steering: drives agent toward a target position.
 */
export function calculateSeek(position, target, velocity, maxSpeed) {
	const desired = scale(normalise(sub(target, position)), maxSpeed);
	return sub(desired, velocity);
}

/**
 * Edge avoidance (non-torus): steer away from borders.
 */
function calculateEdgeAvoidance(position, width, height, margin = 70) {
	const strength = 320;
	let fx = 0, fy = 0;
	if (position.x < margin) fx += strength * (1 - position.x / margin);
	if (position.x > width - margin) fx -= strength * (1 - (width - position.x) / margin);
	if (position.y < margin) fy += strength * (1 - position.y / margin);
	if (position.y > height - margin) fy -= strength * (1 - (height - position.y) / margin);
	return { x: fx, y: fy };
}

/**
 * Wander steering: jittered autonomous locomotion. via a jitter angle on a
 * projected circle (Reynolds 1999).
 */
export function calculateWander(agent, maxSpeed, wanderDist = 80, wanderRadius = 40, wanderJitter = 1.8) {
	agent.wanderAngle += (Math.random() - 0.5) * wanderJitter;
	const heading = normalise(agent.velocity.x === 0 && agent.velocity.y === 0
		? { x: 1, y: 0 } : agent.velocity);
	const circleCenter = add(agent.position, scale(heading, wanderDist));
	const wanderPt = add(circleCenter, {
		x: Math.cos(agent.wanderAngle) * wanderRadius,
		y: Math.sin(agent.wanderAngle) * wanderRadius,
	});
	const desired = scale(normalise(sub(wanderPt, agent.position)), maxSpeed);
	return sub(desired, agent.velocity);
}

// ─── Agent ──────────────────────────────────────────────────────────────────

export class Agent {
	constructor(x, y) {
		this.position = { x, y };
		const angle = Math.random() * Math.PI * 2;
		this.velocity = { x: Math.cos(angle) * 60, y: Math.sin(angle) * 60 };
		this.maxSpeed = 120;
		this.maxForce = 200;
		this.boundingRadius = 12;
		this.wanderAngle = Math.random() * Math.PI * 2;
		this.trail = [];
		this.debugAvoidance = null;
		
		// Hunter memory
		this.lastSeenTargetPos = null;
		this.timeSinceSeen = Number.POSITIVE_INFINITY;
	}
}

// ─── Obstacle ────────────────────────────────────────────────────────────────

export class Obstacle {
	constructor(x, y, radius = 30) {
		this.position = { x, y };
		this.radius = radius;
	}
}

// ─── Simulation ──────────────────────────────────────────────────────────────

export class TacticalHidingSim {
	constructor() {
		this.agents = [];
		this.hunters = [];
		this.obstacles = [];
		this.hunterTarget = null;
	}

	initialise(canvasWidth, canvasHeight) {
		this.agents = [new Agent(canvasWidth * 0.3, canvasHeight * 0.3)];
		this.agents[0].maxSpeed = 100;
		this.hunters = [new Agent(canvasWidth * 0.7, canvasHeight * 0.7)];
		this.hunters[0].maxSpeed = 80;
		this.hunters[0].velocity = { x: -60, y: 0 };
		this.obstacles = [];
		this.hunterTarget = null;
	}

	reset(canvasWidth, canvasHeight) {
		this.initialise(canvasWidth, canvasHeight);
	}

	addAgent(x, y) {
		const a = new Agent(x, y);
		a.maxSpeed = 100;
		this.agents.push(a);
	}

	addHunter(x, y) {
		const h = new Agent(x, y);
		h.maxSpeed = 80;
		this.hunters.push(h);
	}

	addObstacle(x, y, radius) {
		this.obstacles.push(new Obstacle(x, y, radius));
	}

	removeObstacleNear(x, y, threshold = 40) {
		const idx = this.obstacles.findIndex((o) => {
			const dx = o.position.x - x;
			const dy = o.position.y - y;
			return Math.sqrt(dx * dx + dy * dy) < o.radius + threshold;
		});
		if (idx !== -1) { this.obstacles.splice(idx, 1); return true; }
		return false;
	}

	clearObstacles() { this.obstacles = []; }

	setTarget(x, y) { this.hunterTarget = { x, y }; }
	clearTarget() { this.hunterTarget = null; }

	update(params, canvasSize, telemetry) {
		const dt = 1 / 60;
		const maxSpeed = Number(params.maxSpeed);
		const maxForce = Number(params.maxForce);
		const boundingRadius = Number(params.boundingRadius);
		const weightHiding = Number(params.weightHiding ?? 3.0);
		const weightWander = Number(params.weightWander ?? 1.0);
		const showTrail = params.showTrail;
		const torus = params.torusMode;
		const hunterVisionRadius = Number(params.hunterVisionRadius ?? 400);
		const agentVisionRadius = Number(params.agentVisionRadius ?? 400);
		const memoryTime = 5.0; // 5 seconds of memory

		let totalHidingSpots = 0;
		let activePhase = 0;

		// ── Boundary wrap helper
		const handleWrap = (ent) => {
			if (torus) {
				const margin = 40;
				if (ent.position.x < -margin) ent.position.x = canvasSize.width + margin;
				else if (ent.position.x > canvasSize.width + margin) ent.position.x = -margin;
				if (ent.position.y < -margin) ent.position.y = canvasSize.height + margin;
				else if (ent.position.y > canvasSize.height + margin) ent.position.y = -margin;
			} else {
				if (ent.position.x < 0) { ent.position.x = 0; ent.velocity.x = Math.abs(ent.velocity.x); }
				else if (ent.position.x > canvasSize.width) { ent.position.x = canvasSize.width; ent.velocity.x = -Math.abs(ent.velocity.x); }
				if (ent.position.y < 0) { ent.position.y = 0; ent.velocity.y = Math.abs(ent.velocity.y); }
				else if (ent.position.y > canvasSize.height) { ent.position.y = canvasSize.height; ent.velocity.y = -Math.abs(ent.velocity.y); }
			}
		};

		// ── Update Hunters
		for (const hunter of this.hunters) {
			hunter.boundingRadius = 16;
			hunter.timeSinceSeen += dt;

			// Find closest visible agent
			let closestAgent = null;
			let closestDist = hunterVisionRadius;
			for (const agent of this.agents) {
				const d = magnitude(sub(agent.position, hunter.position));
				if (d < closestDist && hasLineOfSight(hunter.position, agent.position, this.obstacles, hunterVisionRadius)) {
					closestDist = d;
					closestAgent = agent;
				}
			}

			let hunterForce = { x: 0, y: 0 };

			if (closestAgent) {
				// Actively hunt
				hunter.lastSeenTargetPos = closestAgent.position;
				hunter.timeSinceSeen = 0;
				hunterForce = calculateSeek(hunter.position, closestAgent.position, hunter.velocity, hunter.maxSpeed);
			} else if (this.hunterTarget) {
				hunterForce = calculateSeek(hunter.position, this.hunterTarget, hunter.velocity, hunter.maxSpeed);
			} else if (hunter.timeSinceSeen < memoryTime && hunter.lastSeenTargetPos) {
				// Investigate last known location
				const d = magnitude(sub(hunter.position, hunter.lastSeenTargetPos));
				if (d > 20) {
					hunterForce = calculateArrive(hunter.position, hunter.lastSeenTargetPos, hunter.velocity, hunter.maxSpeed, 0.5);
				} else {
					hunterForce = calculateWander(hunter, hunter.maxSpeed);
				}
			} else {
				// Wander
				hunterForce = calculateWander(hunter, hunter.maxSpeed);
			}

			// Add obstacle avoidance for hunters too!
			const boxLen = 20 + (magnitude(hunter.velocity) / hunter.maxSpeed) * 40;
			const hAvoidForce = calculateObstacleAvoidance(hunter, this.obstacles, boxLen, { boundingRadius: 16, brakingWeight: 0.2, lateralMultiplier: 8.0 });
			hunterForce = add(hunterForce, scale(hAvoidForce, 15.0));

			if (!torus) hunterForce = add(hunterForce, calculateEdgeAvoidance(hunter.position, canvasSize.width, canvasSize.height));
			
			hunter.velocity = truncate(add(hunter.velocity, scale(truncate(hunterForce, hunter.maxForce), dt)), hunter.maxSpeed);
			hunter.position = add(hunter.position, scale(hunter.velocity, dt));
			
			resolveCollisions(hunter, this.obstacles);
			handleWrap(hunter);
		}

		// ── Update Agents
		for (const agent of this.agents) {
			agent.boundingRadius = boundingRadius;
			let agentForce = { x: 0, y: 0 };

			// Find closest visible hunter
			let closestHunter = null;
			let closestHDist = agentVisionRadius;
			for (const hunter of this.hunters) {
				const d = magnitude(sub(hunter.position, agent.position));
				if (d < closestHDist && hasLineOfSight(agent.position, hunter.position, this.obstacles, agentVisionRadius)) {
					closestHDist = d;
					closestHunter = hunter;
				}
			}

			if (closestHunter) {
				const { force: hidingForce, debug } = calculateTacticalHiding(agent, closestHunter, this.obstacles, params);
				agent.debugAvoidance = debug;
				agentForce = add(agentForce, scale(hidingForce, weightHiding));
				totalHidingSpots += debug.debugSpots.length;
				activePhase = debug.phase;
			} else {
				agent.debugAvoidance = null;
				// Wander safely
				agentForce = add(agentForce, scale(calculateWander(agent, maxSpeed), weightWander));
				activePhase = 0; // Clear
			}

			// Add obstacle avoidance
			const boxLen = 20 + (magnitude(agent.velocity) / agent.maxSpeed) * 40;
			const aAvoidForce = calculateObstacleAvoidance(agent, this.obstacles, boxLen, { boundingRadius, brakingWeight: 0.2, lateralMultiplier: 12.0 });
			agentForce = add(agentForce, scale(aAvoidForce, 10.0)); // Weight avoidance

			if (!torus) {
				const edge = calculateEdgeAvoidance(agent.position, canvasSize.width, canvasSize.height);
				agentForce = add(agentForce, edge);
			}

			const steering = truncate(agentForce, maxForce);
			agent.velocity = truncate(add(agent.velocity, scale(steering, dt)), maxSpeed);

			if (magnitude(agent.velocity) < 5 && agent.debugAvoidance && !agent.debugAvoidance.bestHidingSpot) {
				const heading = normalise(agent.velocity.x === 0 && agent.velocity.y === 0 ? { x: 1, y: 0 } : agent.velocity);
				agent.velocity = scale(heading, 20);
			}

			agent.position = add(agent.position, scale(agent.velocity, dt));
			
			resolveCollisions(agent, this.obstacles);
			handleWrap(agent);
		}

		// ── Trail ────────────────────────────────────────────────────
		for (const agent of this.agents) {
			if (showTrail) {
				agent.trail.push({ x: agent.position.x, y: agent.position.y });
				if (agent.trail.length > 200) agent.trail.shift();
			} else {
				agent.trail = [];
			}
		}

		// ── Telemetry ────────────────────────────────────────────────
		const spd = this.agents.length > 0 ? magnitude(this.agents[0].velocity) : 0;
		telemetry.speed = spd;
		telemetry.hunterSpeed = this.hunters.length > 0 ? magnitude(this.hunters[0].velocity) : 0;
		telemetry.obstacleCount = this.obstacles.length;
		telemetry.hasTarget = this.hunterTarget !== null;
		telemetry.activePhase = activePhase;
		telemetry.hidingSpots = totalHidingSpots;
	}
}
