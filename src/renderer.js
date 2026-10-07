// ==============================================================================
// PYTHON PIT // 60 FPS HTML5 CANVAS RENDERING & PARTICLE SYSTEM
// ==============================================================================

import { TILES } from './world.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 64;
    this.cameraY = 0;
    this.particles = [];
    this.time = 0;

    // Visual rover state with interpolation
    this.visualRover = {
      x: 0,
      y: 0,
      dir: 'DOWN',
      drillAnim: 0,
      scanAnim: 0,
      treadAnim: 0
    };
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  syncRoverPosition(rover, instant = false) {
    if (instant) {
      this.visualRover.x = rover.x;
      this.visualRover.y = rover.y;
      this.visualRover.dir = rover.dir;
    }
  }

  addSparks(x, y, count = 8, color = '#ffd700') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.05
      });
    }
  }

  addRockFragments(x, y, count = 10, color = '#795548') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 0.5, // slight gravity
        color,
        size: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.03
      });
    }
  }

  update(dt, world) {
    this.time += dt;

    // Smoothly interpolate visual rover towards real rover position
    const lerpSpeed = 0.2;
    this.visualRover.x += (world.rover.x - this.visualRover.x) * lerpSpeed;
    this.visualRover.y += (world.rover.y - this.visualRover.y) * lerpSpeed;
    this.visualRover.dir = world.rover.dir;

    if (world.rover.drilling) {
      this.visualRover.drillAnim = (this.visualRover.drillAnim + 0.5) % (Math.PI * 2);
      const drillPos = this.getDrillWorldCoords(this.visualRover.x, this.visualRover.y, this.visualRover.dir);
      this.addSparks(drillPos.x, drillPos.y, 2, '#00ffff');
      this.addRockFragments(drillPos.x, drillPos.y, 1, '#a1887f');
    } else {
      this.visualRover.drillAnim = 0;
    }

    if (world.rover.scanning) {
      this.visualRover.scanAnim = Math.min(1.0, this.visualRover.scanAnim + dt * 3.0);
    } else {
      this.visualRover.scanAnim = 0;
    }

    // Camera vertically centers on rover
    const targetCameraY = this.visualRover.y * this.tileSize - this.canvas.height * 0.45;
    this.cameraY += (targetCameraY - this.cameraY) * 0.1;

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.vrot) p.rot += p.vrot;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getDrillWorldCoords(rx, ry, dir) {
    const cx = (rx + 0.5) * this.tileSize;
    const cy = (ry + 0.5) * this.tileSize;
    const offset = this.tileSize * 0.45;
    if (dir === 'DOWN') return { x: cx, y: cy + offset };
    if (dir === 'UP') return { x: cx, y: cy - offset };
    if (dir === 'RIGHT') return { x: cx + offset, y: cy };
    if (dir === 'LEFT') return { x: cx - offset, y: cy };
    return { x: cx, y: cy + offset };
  }

  render(world) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background with subterranean atmosphere
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);

    // Center grid horizontally
    const gridPixelWidth = world.cols * this.tileSize;
    const offsetX = Math.max(20, Math.floor((w - gridPixelWidth) / 2));
    const offsetY = -Math.floor(this.cameraY);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw Strata Depth Gauge on the left margin
    this.drawDepthGauge(ctx, world);

    // Draw Map Tiles
    for (let r = 0; r < world.rows; r++) {
      for (let c = 0; c < world.cols; c++) {
        const tile = world.grid[r][c];
        const tx = c * this.tileSize;
        const ty = r * this.tileSize;
        this.drawTile(ctx, tile, tx, ty, c, r);
      }
    }

    // Draw Scan wave if active
    if (this.visualRover.scanAnim > 0) {
      this.drawScanWave(ctx, world);
    }

    // Draw Rover
    this.drawRover(ctx, this.visualRover);

    // Draw Particles
    this.drawParticles(ctx);

    ctx.restore();

    // Draw Ambient Underground Vignette & Lighting
    this.drawAtmosphereOverlay(ctx, w, h);
  }

  drawTile(ctx, tile, x, y, col, row) {
    const s = this.tileSize;

    if (tile === TILES.AIR) {
      // Dark hollow cavern
      ctx.fillStyle = '#111622';
      ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#182030';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, s, s);
      return;
    }

    if (tile === TILES.DIRT) {
      // Soft loam dirt with organic textures
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Grain specks
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(x + 12, y + 14, 6, 6);
      ctx.fillRect(x + 36, y + 28, 8, 5);
      ctx.fillRect(x + 20, y + 44, 7, 7);
      ctx.strokeStyle = '#271916';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, s, s);
      return;
    }

    if (tile === TILES.BASALT) {
      // Dense fractured basalt
      ctx.fillStyle = '#263238';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
      // Fracture crack
      ctx.strokeStyle = '#1b2327';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 12);
      ctx.lineTo(x + 24, y + 32);
      ctx.lineTo(x + 50, y + 26);
      ctx.stroke();
      ctx.strokeStyle = '#161d20';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, s, s);
      return;
    }

    if (tile === TILES.MAGMA) {
      // Molten bubbling magma hazard
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 4 + col * 2);
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(x, y, s, s);

      const grad = ctx.createRadialGradient(x + s / 2, y + s / 2, 5, x + s / 2, y + s / 2, s / 1.8);
      grad.addColorStop(0, '#ffff00');
      grad.addColorStop(0.4, '#ff5722');
      grad.addColorStop(1, '#d50000');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 3, y + 3, s - 6, s - 6);

      // Bubbles
      ctx.fillStyle = `rgba(255, 255, 200, ${0.4 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(x + 20 + Math.sin(this.time * 3) * 6, y + 24, 7, 0, Math.PI * 2);
      ctx.arc(x + 42 + Math.cos(this.time * 2.5) * 5, y + 40, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff9100';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
      return;
    }

    if (tile === TILES.CRYSTAL_LITHIUM) {
      // Electric Cyan Lithium Crystal
      ctx.fillStyle = '#111622';
      ctx.fillRect(x, y, s, s);

      const cx = x + s / 2;
      const cy = y + s / 2;
      const shimmer = Math.sin(this.time * 5 + col) * 0.2 + 0.8;

      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12 * shimmer;

      // Multi-point gem
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 14, cy - 4);
      ctx.lineTo(cx + 8, cy + 18);
      ctx.lineTo(cx - 8, cy + 18);
      ctx.lineTo(cx - 14, cy - 4);
      ctx.closePath();
      ctx.fill();

      // Facet highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 4, cy - 4);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 10, cy - 4);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      return;
    }

    if (tile === TILES.CRYSTAL_EMERALD) {
      // Radiant Green Emerald Geode
      ctx.fillStyle = '#111622';
      ctx.fillRect(x, y, s, s);

      const cx = x + s / 2;
      const cy = y + s / 2;
      const shimmer = Math.sin(this.time * 6 + row) * 0.2 + 0.8;

      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 14 * shimmer;

      ctx.fillStyle = '#00c853';
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 10);
      ctx.lineTo(cx, cy - 22);
      ctx.lineTo(cx + 16, cy - 10);
      ctx.lineTo(cx + 16, cy + 10);
      ctx.lineTo(cx, cy + 22);
      ctx.lineTo(cx - 16, cy + 10);
      ctx.closePath();
      ctx.fill();

      // Shimmer face
      ctx.fillStyle = '#b9f6ca';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 16, cy - 10);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      return;
    }

    if (tile === TILES.POWER_CELL) {
      // Glowing Amber Power Cell
      ctx.fillStyle = '#111622';
      ctx.fillRect(x, y, s, s);

      const cx = x + s / 2;
      const cy = y + s / 2;

      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx - 14, cy - 20, 28, 40);

      ctx.fillStyle = '#ffb300';
      ctx.shadowColor = '#ffb300';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - 10, cy - 14, 20, 28);
      ctx.shadowBlur = 0;

      // Lightning bolt icon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx - 5, cy);
      ctx.lineTo(cx + 1, cy);
      ctx.lineTo(cx - 2, cy + 10);
      ctx.lineTo(cx + 5, cy - 1);
      ctx.lineTo(cx - 1, cy - 1);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (tile === TILES.DROP_POD) {
      // Extraction Drop Pod with hazard stripes & landing pad
      ctx.fillStyle = '#263238';
      ctx.fillRect(x, y, s, s);

      // Warning chevron hatch
      ctx.fillStyle = '#ffc107';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

      ctx.fillStyle = '#212121';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 8 + i * 14, y + 4);
        ctx.lineTo(x + 16 + i * 14, y + 4);
        ctx.lineTo(x + 8 + i * 14, y + s - 4);
        ctx.lineTo(x + i * 14, y + s - 4);
        ctx.closePath();
        ctx.fill();
      }

      // Beacon light in center
      const beaconGlow = 0.5 + 0.5 * Math.sin(this.time * 8);
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15 * beaconGlow;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      return;
    }

    if (tile === TILES.TITANIUM_ARMOR) {
      // Reinforced blast gate
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

      // Rivets
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(x + 8, y + 8, 4, 4);
      ctx.fillRect(x + s - 12, y + 8, 4, 4);
      ctx.fillRect(x + 8, y + s - 12, 4, 4);
      ctx.fillRect(x + s - 12, y + s - 12, 4, 4);

      // Hazard emblem
      ctx.fillStyle = '#ff3d00';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 18);
      ctx.lineTo(x + s / 2 + 14, y + s - 18);
      ctx.lineTo(x + s / 2 - 14, y + s - 18);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (tile === TILES.BEDROCK) {
      // Impassable perimeter bedrock
      ctx.fillStyle = '#1a1f2c';
      ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, s, s);
      return;
    }
  }

  drawRover(ctx, rover) {
    const s = this.tileSize;
    const cx = (rover.x + 0.5) * s;
    const cy = (rover.y + 0.5) * s;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotate according to facing direction
    let angle = 0;
    if (rover.dir === 'DOWN') angle = 0;
    else if (rover.dir === 'UP') angle = Math.PI;
    else if (rover.dir === 'RIGHT') angle = -Math.PI / 2;
    else if (rover.dir === 'LEFT') angle = Math.PI / 2;

    ctx.rotate(angle);

    // 1. Headlight beam projecting forward
    const beamGrad = ctx.createRadialGradient(0, 20, 10, 0, 70, 75);
    beamGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    beamGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-16, 20);
    ctx.lineTo(-40, 90);
    ctx.lineTo(40, 90);
    ctx.lineTo(16, 20);
    ctx.closePath();
    ctx.fill();

    // 2. Heavy Dual Caterpillar Treads
    ctx.fillStyle = '#1e2430';
    // Left tread
    ctx.fillRect(-26, -24, 10, 48);
    // Right tread
    ctx.fillRect(16, -24, 10, 48);

    // Tread segment lines
    ctx.fillStyle = '#374151';
    for (let i = -20; i <= 20; i += 8) {
      ctx.fillRect(-26, i, 10, 2);
      ctx.fillRect(16, i, 10, 2);
    }

    // 3. Main Rover Chassis Body (High-tech cyber armor)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, -18, -20, 36, 40, 6, true, true);

    // Cabin Windshield / Sensor Lens
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(0, -4, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -7, 6, 3);

    // 4. Heavy Diamond Drill Assembly (at the front / bottom in local coords)
    const drillOffset = Math.sin(rover.drillAnim * 4) * 3;
    ctx.fillStyle = '#475569';
    ctx.fillRect(-8, 16, 16, 8 + drillOffset);

    // Rotating drill tip
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = rover.drillAnim > 0 ? 12 : 0;
    ctx.beginPath();
    ctx.moveTo(0, 28 + drillOffset);
    ctx.lineTo(-10, 18 + drillOffset);
    ctx.lineTo(10, 18 + drillOffset);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Power Core Glow
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawScanWave(ctx, world) {
    const s = this.tileSize;
    const cx = (world.rover.x + 0.5) * s;
    const cy = (world.rover.y + 0.5) * s;
    const radius = this.visualRover.scanAnim * s * 1.8;

    ctx.save();
    ctx.strokeStyle = `rgba(0, 229, 255, ${1.0 - this.visualRover.scanAnim})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  drawDepthGauge(ctx, world) {
    const s = this.tileSize;
    ctx.fillStyle = '#4b5563';
    ctx.font = '10px "Fira Code", monospace';
    ctx.textAlign = 'right';

    for (let r = 0; r < world.rows; r++) {
      const depthMeters = r * 50;
      ctx.fillText(`-${depthMeters}m`, -8, r * s + s / 2 + 4);
    }
  }

  drawAtmosphereOverlay(ctx, w, h) {
    // Subtle edge vignette
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(5, 8, 14, 0.7)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}
