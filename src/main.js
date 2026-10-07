// ==============================================================================
// PYTHON PIT // MAIN COORDINATOR & GAME CONTROLLER
// ==============================================================================

import { SubterraneanWorld, TILES } from './world.js';
import { CanvasRenderer } from './renderer.js';
import { sound } from './audio.js';
import { PyodideRunner } from './pyodide_runner.js';
import { CodeEditor } from './editor.js';
import { LEVELS } from './curriculum/levels.js';

class GameController {
  constructor() {
    this.currentLevelIndex = 0;
    this.speed = 1.0;
    this.isRunning = false;
    this.actionQueue = [];
    this.actionTimer = null;

    // Load saved progress
    this.unlockedLevel = parseInt(localStorage.getItem('pythonpit_unlocked') || '0', 10);
    this.savedCodes = JSON.parse(localStorage.getItem('pythonpit_saved_code') || '{}');

    this.initDOM();
    this.initSystems();
  }

  initDOM() {
    // Elements
    this.canvas = document.getElementById('world-canvas');
    this.editorContainer = document.getElementById('code-editor-container');
    this.levelSelect = document.getElementById('level-select');
    this.runBtn = document.getElementById('btn-run');
    this.demoBtn = document.getElementById('btn-demo');
    this.resetBtn = document.getElementById('btn-reset');
    this.speedBtn = document.getElementById('btn-speed');
    this.muteBtn = document.getElementById('btn-mute');
    this.docsBtn = document.getElementById('btn-docs');
    this.docsModal = document.getElementById('docs-modal');
    this.docsClose = document.getElementById('docs-close');
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryNextBtn = document.getElementById('victory-next-btn');
    this.victoryCloseBtn = document.getElementById('victory-close-btn');
    this.victoryMsg = document.getElementById('victory-msg');

    // Telemetry HUD Elements
    this.hudDepth = document.getElementById('hud-depth');
    this.hudBattery = document.getElementById('hud-battery');
    this.hudCargo = document.getElementById('hud-cargo');
    this.hudTorque = document.getElementById('hud-torque');
    this.hudStrata = document.getElementById('hud-strata');
    this.levelTitle = document.getElementById('level-title');
    this.levelSubtitle = document.getElementById('level-subtitle');
    this.levelObjectives = document.getElementById('level-objectives');
    this.runtimeStatus = document.getElementById('runtime-status');
    this.consoleLogs = document.getElementById('console-logs');
  }

  async initSystems() {
    // 1. Renderer
    this.renderer = new CanvasRenderer(this.canvas);
    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());

    // 2. Pyodide Engine
    this.pyodide = new PyodideRunner((state, message) => {
      this.updateRuntimeStatus(state, message);
    });
    this.pyodide.init(); // Asynchronously boots Pyodide in background

    // 3. Code Editor
    this.editor = new CodeEditor(this.editorContainer, (code) => {
      this.savedCodes[this.currentLevelIndex] = code;
      localStorage.setItem('pythonpit_saved_code', JSON.stringify(this.savedCodes));
    });

    // 4. World
    this.loadLevel(this.currentLevelIndex);

    // 5. Populate Level Selector Dropdown
    this.renderLevelSelector();

    // 6. Bind Event Listeners
    this.bindEvents();

    // 7. Start Render Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  renderLevelSelector() {
    this.levelSelect.innerHTML = '';
    LEVELS.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const isLocked = idx > this.unlockedLevel;
      opt.textContent = `${isLocked ? '🔒' : '⚡'} ${lvl.title}`;
      if (idx === this.currentLevelIndex) opt.selected = true;
      this.levelSelect.appendChild(opt);
    });
  }

  loadLevel(index) {
    if (this.isRunning) this.stopExecution();

    this.currentLevelIndex = index;
    const lvl = LEVELS[index];

    // Initialize world
    this.world = new SubterraneanWorld(lvl);
    this.renderer.syncRoverPosition(this.world.rover, true);

    // Update UI headers
    this.levelTitle.textContent = lvl.title;
    this.levelSubtitle.textContent = lvl.subtitle;
    this.hudStrata.textContent = lvl.strata;

    // Objectives list
    this.levelObjectives.innerHTML = lvl.objectives.map(obj => `<li>${obj}</li>`).join('');

    // Restore saved code or load starter code
    const saved = this.savedCodes[index];
    this.editor.setValue(saved !== undefined ? saved : lvl.starterCode);

    this.updateHUD();
    this.clearConsole();
    this.logConsole(`System ready. Connected to ${lvl.title} strata.`, 'info');
  }

  bindEvents() {
    // Level Switch
    this.levelSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.loadLevel(parseInt(e.target.value, 10));
    });

    // Run Python
    this.runBtn.addEventListener('click', () => {
      sound.playClick();
      this.executePython(this.editor.getValue());
    });

    // Watch Demo
    this.demoBtn.addEventListener('click', () => {
      sound.playClick();
      const lvl = LEVELS[this.currentLevelIndex];
      this.editor.setValue(lvl.demoCode);
      this.logConsole("Loading optimal Python demo solution...", "info");
      this.executePython(lvl.demoCode);
    });

    // Reset World
    this.resetBtn.addEventListener('click', () => {
      sound.playClick();
      this.stopExecution();
      this.world.initFromLevel(LEVELS[this.currentLevelIndex]);
      this.renderer.syncRoverPosition(this.world.rover, true);
      this.editor.clearHighlight();
      this.updateHUD();
      this.logConsole("Simulation reset to spawn point.", "info");
    });

    // Speed Selector
    this.speedBtn.addEventListener('click', () => {
      sound.playClick();
      if (this.speed === 1.0) this.speed = 2.0;
      else if (this.speed === 2.0) this.speed = 4.0;
      else if (this.speed === 4.0) this.speed = 0.5;
      else this.speed = 1.0;
      this.speedBtn.textContent = `⚡ SPEED: ${this.speed}x`;
    });

    // Sound Mute Toggle
    this.muteBtn.addEventListener('click', () => {
      const muted = sound.toggleMute();
      this.muteBtn.textContent = muted ? '🔇 MUTED' : '🔊 AUDIO';
    });

    // Reference Docs Modal
    this.docsBtn.addEventListener('click', () => {
      sound.playClick();
      this.docsModal.classList.remove('hidden');
    });
    this.docsClose.addEventListener('click', () => {
      sound.playClick();
      this.docsModal.classList.add('hidden');
    });

    // Victory Modal
    this.victoryNextBtn.addEventListener('click', () => {
      sound.playClick();
      this.victoryModal.classList.add('hidden');
      if (this.currentLevelIndex + 1 < LEVELS.length) {
        this.loadLevel(this.currentLevelIndex + 1);
        this.renderLevelSelector();
      }
    });
    // Copy Logs Button
    const copyBtn = document.getElementById('btn-copy-console');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        sound.playClick();
        const text = this.consoleLogs.innerText || this.consoleLogs.textContent;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = '✅ COPIED!';
          setTimeout(() => { copyBtn.textContent = '📋 COPY LOGS'; }, 1500);
        }).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = '✅ COPIED!';
          setTimeout(() => { copyBtn.textContent = '📋 COPY LOGS'; }, 1500);
        });
      });
    }

    // Manual D-Pad Controls
    this.bindManualControls();
  }

  bindManualControls() {
    const bindBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (this.isRunning) return;
          fn();
        });
      }
    };

    bindBtn('dpad-up', () => this.manualMove('UP'));
    bindBtn('dpad-down', () => this.manualMove('DOWN'));
    bindBtn('dpad-left', () => this.manualMove('LEFT'));
    bindBtn('dpad-right', () => this.manualMove('RIGHT'));
    bindBtn('dpad-drill', () => this.manualDrill());
    bindBtn('dpad-scan', () => this.manualScan());
    bindBtn('dpad-collect', () => this.manualCollect());

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (this.isRunning) return;
      // Don't trigger if typing inside code editor
      if (document.activeElement === this.editor.textarea) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.manualMove('UP');
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.manualMove('DOWN');
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.manualMove('LEFT');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.manualMove('RIGHT');
      else if (e.key === ' ' || e.key === 'x') { e.preventDefault(); this.manualDrill(); }
      else if (e.key === 'e' || e.key === 'c') this.manualCollect();
      else if (e.key === 'q' || e.key === 'r') this.manualScan();
    });
  }

  manualMove(dir) {
    this.world.rover.dir = dir;
    const next = this.world.getFrontCoords(dir);
    if (this.world.canMoveTo(next.x, next.y)) {
      this.world.rover.x = next.x;
      this.world.rover.y = next.y;
      sound.playMove();
      this.updateHUD();
      this.checkLevelOutcome();
    }
  }

  manualDrill() {
    const target = this.world.getFrontCoords();
    const tile = this.world.getTile(target.x, target.y);

    if (tile === TILES.CRYSTAL_EMERALD) {
      this.world.rover.cargo.push("Emerald Geode");
      this.world.setTile(target.x, target.y, TILES.AIR);
      sound.playCollect();
      this.renderer.addSparks((target.x + 0.5) * this.renderer.tileSize, (target.y + 0.5) * this.renderer.tileSize, 16, '#00e676');
      this.logConsole("💎 Harvested: Emerald Geode with diamond drill! (+1 to cargo)", "success");
      this.updateHUD();
      this.checkLevelOutcome();
      return;
    }

    if (tile === TILES.CRYSTAL_LITHIUM) {
      this.world.rover.cargo.push("Lithium Core");
      this.world.setTile(target.x, target.y, TILES.AIR);
      sound.playCollect();
      this.renderer.addSparks((target.x + 0.5) * this.renderer.tileSize, (target.y + 0.5) * this.renderer.tileSize, 16, '#00e5ff');
      this.logConsole("💎 Harvested: Lithium Core with diamond drill! (+1 to cargo)", "success");
      this.updateHUD();
      this.checkLevelOutcome();
      return;
    }

    if (tile === TILES.DIRT || tile === TILES.BASALT || (tile === TILES.TITANIUM_ARMOR && this.world.rover.systems.torque >= 80)) {
      this.world.rover.drilling = true;
      sound.playDrill();
      setTimeout(() => {
        this.world.setTile(target.x, target.y, TILES.AIR);
        this.world.rover.drilling = false;
        this.updateHUD();
      }, 150);
    } else if (tile === TILES.MAGMA) {
      sound.playHazard();
      this.logConsole("CRITICAL WARNING: Drill breached molten magma fissure!", "error");
    } else {
      sound.playClick();
    }
  }

  manualScan() {
    this.world.rover.scanning = true;
    sound.playScan();
    const below = this.world.getFrontCoords('DOWN');
    const tile = this.world.getTile(below.x, below.y);
    const names = { [TILES.AIR]: 'AIR', [TILES.DIRT]: 'DIRT', [TILES.BASALT]: 'BASALT', [TILES.MAGMA]: 'MAGMA', [TILES.CRYSTAL_EMERALD]: 'EMERALD', [TILES.CRYSTAL_LITHIUM]: 'LITHIUM', [TILES.DROP_POD]: 'DROP_POD' };
    this.logConsole(`[RADAR SCAN] Below Strata: ${names[tile] || 'BEDROCK'}`, 'info');
    setTimeout(() => {
      this.world.rover.scanning = false;
    }, 400);
  }

  manualCollect() {
    let tile = this.world.getTile(this.world.rover.x, this.world.rover.y);
    let tx = this.world.rover.x;
    let ty = this.world.rover.y;

    // Check front tile if current tile has no collectible item
    if (tile !== TILES.CRYSTAL_EMERALD && tile !== TILES.CRYSTAL_LITHIUM && tile !== TILES.POWER_CELL) {
      const front = this.world.getFrontCoords();
      const frontTile = this.world.getTile(front.x, front.y);
      if (frontTile === TILES.CRYSTAL_EMERALD || frontTile === TILES.CRYSTAL_LITHIUM || frontTile === TILES.POWER_CELL) {
        tile = frontTile;
        tx = front.x;
        ty = front.y;
      }
    }

    if (tile === TILES.CRYSTAL_EMERALD) {
      this.world.rover.cargo.push("Emerald Geode");
      this.world.setTile(tx, ty, TILES.AIR);
      sound.playCollect();
      this.renderer.addSparks((tx + 0.5) * this.renderer.tileSize, (ty + 0.5) * this.renderer.tileSize, 16, '#00e676');
      this.logConsole("💎 Secured: Emerald Geode (+1 to cargo)", "success");
      this.updateHUD();
    } else if (tile === TILES.CRYSTAL_LITHIUM) {
      this.world.rover.cargo.push("Lithium Core");
      this.world.setTile(tx, ty, TILES.AIR);
      sound.playCollect();
      this.renderer.addSparks((tx + 0.5) * this.renderer.tileSize, (ty + 0.5) * this.renderer.tileSize, 16, '#00e5ff');
      this.logConsole("💎 Secured: Lithium Core (+1 to cargo)", "success");
      this.updateHUD();
    } else if (tile === TILES.POWER_CELL) {
      this.world.rover.battery = Math.min(100, this.world.rover.battery + 50);
      this.world.setTile(tx, ty, TILES.AIR);
      sound.playCollect();
      this.renderer.addSparks((tx + 0.5) * this.renderer.tileSize, (ty + 0.5) * this.renderer.tileSize, 16, '#ffb300');
      this.logConsole("⚡ Recharged: Power Cell (+50% battery)", "success");
      this.updateHUD();
    } else {
      this.logConsole("No minerals within reach to collect. (Move onto or face the crystal)", "info");
    }
    this.checkLevelOutcome();
  }

  async executePython(code) {
    if (this.isRunning) this.stopExecution();

    this.clearConsole();
    this.logConsole("Executing Python code in CPython 3.11 WASM...", "info");

    // Reset world to level spawn first
    this.world.initFromLevel(LEVELS[this.currentLevelIndex]);
    this.renderer.syncRoverPosition(this.world.rover, true);

    const result = await this.pyodide.execute(code, this.world);

    // Print stdout
    if (result.output && result.output.length > 0) {
      result.output.forEach(out => this.logConsole(`[stdout] ${out}`, "output"));
    }

    if (!result.success) {
      sound.playError();
      this.logConsole(`PYTHON ERROR:\n${result.error}`, "error");
      // Highlight error line if detectable
      const m = result.error.match(/Line (\d+)/);
      if (m) this.editor.setErrorLine(parseInt(m[1], 10));
      return;
    }

    // Playback recorded actions
    this.playActionQueue(result.actions);
  }

  playActionQueue(actions) {
    this.isRunning = true;
    this.runBtn.disabled = true;
    this.demoBtn.disabled = true;
    this.actionQueue = [...actions];

    const stepInterval = Math.max(60, Math.floor(320 / this.speed));

    const stepNext = () => {
      if (!this.isRunning || this.actionQueue.length === 0) {
        this.finishExecution();
        return;
      }

      const item = this.actionQueue.shift();
      this.applyRecordedAction(item);

      this.actionTimer = setTimeout(stepNext, stepInterval);
    };

    stepNext();
  }

  applyRecordedAction(item) {
    const { action, lineno, simX, simY, simDir, simCargo, simSystems } = item;

    // Highlight code line
    if (lineno) {
      this.editor.highlightLine(lineno);
    }

    // Apply to world state
    this.world.rover.x = simX;
    this.world.rover.y = simY;
    this.world.rover.dir = simDir;
    this.world.rover.cargo = [...simCargo];
    this.world.rover.systems = { ...simSystems };

    // Trigger visual and audio effects
    if (action === 'drill') {
      this.world.rover.drilling = true;
      sound.playDrill();
      // Clear front tile
      const target = this.world.getFrontCoords(simDir);
      const fTile = this.world.getTile(target.x, target.y);
      if (fTile === TILES.CRYSTAL_EMERALD || fTile === TILES.CRYSTAL_LITHIUM) {
        sound.playCollect();
        this.renderer.addSparks((target.x + 0.5) * this.renderer.tileSize, (target.y + 0.5) * this.renderer.tileSize, 16, '#00e676');
      }
      this.world.setTile(target.x, target.y, TILES.AIR);
      setTimeout(() => { this.world.rover.drilling = false; }, 180 / this.speed);
    } else if (action === 'collect') {
      sound.playCollect();
      this.world.setTile(simX, simY, TILES.AIR);
      const target = this.world.getFrontCoords(simDir);
      const fTile = this.world.getTile(target.x, target.y);
      if (fTile === TILES.CRYSTAL_EMERALD || fTile === TILES.CRYSTAL_LITHIUM || fTile === TILES.POWER_CELL) {
        this.world.setTile(target.x, target.y, TILES.AIR);
      }
      this.renderer.addSparks((simX + 0.5) * this.renderer.tileSize, (simY + 0.5) * this.renderer.tileSize, 16, '#00e676');
    } else if (action === 'scan') {
      this.world.rover.scanning = true;
      sound.playScan();
      setTimeout(() => { this.world.rover.scanning = false; }, 300 / this.speed);
    } else if (action.startsWith('move')) {
      sound.playMove();
    }

    this.updateHUD();
  }

  finishExecution() {
    this.stopExecution();
    this.editor.clearHighlight();
    this.checkLevelOutcome();
  }

  stopExecution() {
    this.isRunning = false;
    this.runBtn.disabled = false;
    this.demoBtn.disabled = false;
    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
      this.actionTimer = null;
    }
    this.actionQueue = [];
    this.world.rover.drilling = false;
    this.world.rover.scanning = false;
  }

  checkLevelOutcome() {
    const outcome = this.world.checkObjectives();
    if (outcome.won) {
      sound.playVictory();
      this.logConsole(`MISSION ACCOMPLISHED: ${outcome.message}`, "success");
      this.victoryMsg.textContent = outcome.message;
      this.victoryModal.classList.remove('hidden');

      // Unlock next sector
      if (this.currentLevelIndex + 1 > this.unlockedLevel) {
        this.unlockedLevel = Math.min(LEVELS.length - 1, this.currentLevelIndex + 1);
        localStorage.setItem('pythonpit_unlocked', this.unlockedLevel.toString());
        this.renderLevelSelector();
      }
    } else {
      this.logConsole(`Status: ${outcome.message}`, "info");
    }
  }

  updateHUD() {
    this.hudDepth.textContent = `-${this.world.getDepthMeters()}m`;
    this.hudBattery.textContent = `${this.world.rover.battery}%`;
    this.hudCargo.textContent = `[${this.world.rover.cargo.length}] ${this.world.rover.cargo.join(', ') || 'EMPTY'}`;
    this.hudTorque.textContent = `${this.world.rover.systems.torque} Nm`;
  }

  updateRuntimeStatus(state, msg) {
    if (state === 'READY') {
      this.runtimeStatus.innerHTML = `<span class="badge-ready">🟢 ${msg}</span>`;
    } else if (state === 'LOADING') {
      this.runtimeStatus.innerHTML = `<span class="badge-loading">🟡 ${msg}</span>`;
    } else {
      this.runtimeStatus.innerHTML = `<span class="badge-fallback">🔵 ${msg}</span>`;
    }
  }

  logConsole(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.textContent = `> ${text}`;
    this.consoleLogs.appendChild(line);
    this.consoleLogs.scrollTop = this.consoleLogs.scrollHeight;
  }

  clearConsole() {
    this.consoleLogs.innerHTML = '';
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.renderer.update(dt, this.world);
    this.renderer.render(this.world);

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameController();
});
