// ==============================================================================
// PYTHON PIT // CPYTHON 3.11 (PYODIDE WASM) EXECUTION & STEP-TRACER
// ==============================================================================

import { TILES } from './world.js';

export class PyodideRunner {
  constructor(onStatusChange) {
    this.pyodide = null;
    this.isLoading = false;
    this.isReady = false;
    this.loadError = null;
    this.onStatusChange = onStatusChange || (() => {});
  }

  async init() {
    if (this.isReady || this.isLoading) return;
    this.isLoading = true;
    this.onStatusChange('LOADING', 'Downloading CPython 3.11 WebAssembly...');

    try {
      // Check if pyodide script is already loaded
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Pyodide CDN'));
          document.head.appendChild(script);
        });
      }

      this.pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
      });

      this.isReady = true;
      this.isLoading = false;
      this.onStatusChange('READY', 'CPython 3.11 WASM Engine Active');
      console.log('Pyodide CPython 3.11 WASM loaded successfully.');
    } catch (err) {
      console.warn('Pyodide CDN load failed or offline, using built-in Python mini-interpreter fallback:', err);
      this.loadError = err;
      this.isLoading = false;
      this.isReady = false;
      this.onStatusChange('FALLBACK', 'Offline Python Mini-Interpreter Ready');
    }
  }

  // Prepares the Python execution environment and runs user code
  async execute(userCode, world) {
    // Collect recorded actions for visual animation
    const recordedActions = [];
    const printOutputs = [];

    // Map tile numbers to strings for Python
    const tileNameMap = {
      [TILES.AIR]: 'AIR',
      [TILES.DIRT]: 'DIRT',
      [TILES.BASALT]: 'BASALT',
      [TILES.MAGMA]: 'MAGMA',
      [TILES.CRYSTAL_LITHIUM]: 'LITHIUM',
      [TILES.CRYSTAL_EMERALD]: 'EMERALD',
      [TILES.POWER_CELL]: 'POWER_CELL',
      [TILES.DROP_POD]: 'DROP_POD',
      [TILES.BEDROCK]: 'BEDROCK',
      [TILES.TITANIUM_ARMOR]: 'TITANIUM_ARMOR'
    };

    if (this.isReady && this.pyodide) {
      return this.runWithPyodide(userCode, world, recordedActions, printOutputs, tileNameMap);
    } else {
      return this.runWithFallback(userCode, world, recordedActions, printOutputs, tileNameMap);
    }
  }

  async runWithPyodide(userCode, world, recordedActions, printOutputs, tileNameMap) {
    // Clone world for simulation step testing
    const simGrid = world.grid.map(row => [...row]);
    let simX = world.rover.x;
    let simY = world.rover.y;
    let simDir = world.rover.dir;
    let simCargo = [...world.rover.cargo];
    let simSystems = { ...world.rover.systems };
    let simBattery = world.rover.battery;
    let stepCount = 0;
    const MAX_STEPS = 600;

    // Define JS bridge exposed to Python (no leading double underscores to avoid Python class name mangling!)
    window.pyBridge = {
      print: (text) => {
        printOutputs.push(String(text));
      },
      setTorque: (val) => {
        simSystems.torque = Number(val) || 40;
      },
      collectTile: () => {
        // 1. Check current tile
        let tile = simGrid[simY][simX];
        let targetX = simX;
        let targetY = simY;

        // 2. If current tile has no collectible, check front tile
        if (tile !== TILES.CRYSTAL_EMERALD && tile !== TILES.CRYSTAL_LITHIUM && tile !== TILES.POWER_CELL) {
          let fx = simX;
          let fy = simY;
          if (simDir === 'DOWN') fy++;
          else if (simDir === 'UP') fy--;
          else if (simDir === 'RIGHT') fx++;
          else if (simDir === 'LEFT') fx--;

          if (fx >= 0 && fx < world.cols && fy >= 0 && fy < world.rows) {
            const frontTile = simGrid[fy][fx];
            if (frontTile === TILES.CRYSTAL_EMERALD || frontTile === TILES.CRYSTAL_LITHIUM || frontTile === TILES.POWER_CELL) {
              tile = frontTile;
              targetX = fx;
              targetY = fy;
            }
          }
        }

        if (tile === TILES.CRYSTAL_EMERALD) {
          simCargo.push("Emerald Geode");
          simGrid[targetY][targetX] = TILES.AIR;
          return "Emerald Geode";
        } else if (tile === TILES.CRYSTAL_LITHIUM) {
          simCargo.push("Lithium Core");
          simGrid[targetY][targetX] = TILES.AIR;
          return "Lithium Core";
        } else if (tile === TILES.POWER_CELL) {
          simBattery = Math.min(100, simBattery + 50);
          simGrid[targetY][targetX] = TILES.AIR;
          return "Power Cell";
        }
        return "";
      },
      recordAction: (action, lineno, extra) => {
        if (++stepCount > MAX_STEPS) {
          throw new Error("Execution limit exceeded (possible infinite loop)");
        }

        // Apply action to simulation state
        if (action === 'move_down') {
          simDir = 'DOWN';
          if (simY + 1 < world.rows) simY++;
        } else if (action === 'move_up') {
          simDir = 'UP';
          if (simY - 1 >= 0) simY--;
        } else if (action === 'move_left') {
          simDir = 'LEFT';
          if (simX - 1 >= 0) simX--;
        } else if (action === 'move_right') {
          simDir = 'RIGHT';
          if (simX + 1 < world.cols) simX++;
        } else if (action.startsWith('turn_')) {
          simDir = action.replace('turn_', '').toUpperCase();
        } else if (action === 'drill') {
          let tx = simX;
          let ty = simY;
          if (simDir === 'DOWN') ty++;
          else if (simDir === 'UP') ty--;
          else if (simDir === 'RIGHT') tx++;
          else if (simDir === 'LEFT') tx--;

          if (tx >= 0 && tx < world.cols && ty >= 0 && ty < world.rows) {
            const tile = simGrid[ty][tx];
            if (tile === TILES.TITANIUM_ARMOR && simSystems.torque < 80) {
              extra = 'bounced';
            } else if (tile === TILES.CRYSTAL_EMERALD) {
              // Drilling a mineral crystal automatically harvests it!
              simCargo.push("Emerald Geode");
              simGrid[ty][tx] = TILES.AIR;
              extra = 'harvested_emerald';
            } else if (tile === TILES.CRYSTAL_LITHIUM) {
              simCargo.push("Lithium Core");
              simGrid[ty][tx] = TILES.AIR;
              extra = 'harvested_lithium';
            } else {
              simGrid[ty][tx] = TILES.AIR;
            }
          }
        }

        recordedActions.push({
          action,
          lineno: Number(lineno) || 1,
          simX,
          simY,
          simDir,
          simCargo: [...simCargo],
          simSystems: { ...simSystems },
          simBattery,
          extra: extra || null
        });
      },
      getScanDown: () => {
        const ty = simY + 1;
        if (ty >= world.rows) return 'BEDROCK';
        return tileNameMap[simGrid[ty][simX]] || 'BEDROCK';
      },
      getScanTile: (dx, dy) => {
        const tx = simX + dx;
        const ty = simY + dy;
        if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return 'BEDROCK';
        return tileNameMap[simGrid[ty][tx]] || 'BEDROCK';
      }
    };

    // Configure Pyodide native stdout
    if (this.pyodide.setStdout) {
      this.pyodide.setStdout({
        batched: (text) => {
          printOutputs.push(String(text));
        }
      });
    }

    // Python wrapper script
    const harness = `
import sys
import inspect
import js

bridge = js.pyBridge

class RoverProxy:
    def __init__(self):
        self.systems = {"torque": 40, "shield": 100}
        self.cargo = []
        self.battery = 100

    def _line(self):
        try:
            return inspect.currentframe().f_back.f_back.f_lineno
        except:
            return 1

    def move_down(self):
        bridge.recordAction("move_down", self._line(), "")

    def move_up(self):
        bridge.recordAction("move_up", self._line(), "")

    def move_left(self):
        bridge.recordAction("move_left", self._line(), "")

    def move_right(self):
        bridge.recordAction("move_right", self._line(), "")

    def drill(self):
        t = int(self.systems.get("torque", 40))
        bridge.setTorque(t)
        bridge.recordAction("drill", self._line(), "")

    def drill_down(self):
        self.turn("DOWN")
        self.drill()

    def drill_up(self):
        self.turn("UP")
        self.drill()

    def drill_left(self):
        self.turn("LEFT")
        self.drill()

    def drill_right(self):
        self.turn("RIGHT")
        self.drill()

    def turn(self, direction):
        bridge.recordAction("turn_" + str(direction).lower(), self._line(), "")

    def collect(self):
        item = str(bridge.collectTile())
        if item:
            self.cargo.append(item)
        bridge.recordAction("collect", self._line(), "")

    def scan_down(self):
        res = str(bridge.getScanDown())
        bridge.recordAction("scan", self._line(), "DOWN")
        return res

    def scan_ahead(self):
        return self.scan_down()

rover = RoverProxy()
`;

    try {
      // Run the harness first
      await this.pyodide.runPythonAsync(harness);
      // Run user code
      await this.pyodide.runPythonAsync(userCode);

      return {
        success: true,
        actions: recordedActions,
        output: printOutputs,
        error: null
      };
    } catch (err) {
      console.warn("Python execution error:", err);
      return {
        success: false,
        actions: recordedActions,
        output: printOutputs,
        error: this.formatPythonError(err)
      };
    }
  }

  // Built-in fallback mini-interpreter for offline or instant execution
  runWithFallback(userCode, world, recordedActions, printOutputs, tileNameMap) {
    const lines = userCode.split('\n');
    const simGrid = world.grid.map(row => [...row]);
    let simX = world.rover.x;
    let simY = world.rover.y;
    let simDir = world.rover.dir;
    let simCargo = [...world.rover.cargo];
    let simSystems = { ...world.rover.systems };
    let simBattery = world.rover.battery;

    try {
      let i = 0;
      let iterations = 0;
      const MAX_STEPS = 500;

      while (i < lines.length && iterations < MAX_STEPS) {
        iterations++;
        const rawLine = lines[i];
        const lineno = i + 1;
        const line = rawLine.trim();

        if (!line || line.startsWith('#')) {
          i++;
          continue;
        }

        // Simple 'for ... in range(N):' loop support
        const forMatch = line.match(/^for\s+\w+\s+in\s+range\((\d+)\):/);
        if (forMatch) {
          const count = parseInt(forMatch[1], 10);
          // Find indented block
          const blockLines = [];
          let j = i + 1;
          while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || !lines[j].trim())) {
            if (lines[j].trim()) {
              blockLines.push({ text: lines[j].trim(), lineno: j + 1 });
            }
            j++;
          }

          for (let c = 0; c < count; c++) {
            for (const b of blockLines) {
              this.evalFallbackStatement(b.text, b.lineno, world, simGrid, {
                get x() { return simX; }, set x(v) { simX = v; },
                get y() { return simY; }, set y(v) { simY = v; },
                get dir() { return simDir; }, set dir(v) { simDir = v; },
                cargo: simCargo,
                systems: simSystems,
                battery: simBattery
              }, recordedActions, printOutputs, tileNameMap);
            }
          }
          i = j;
          continue;
        }

        // Direct statement
        this.evalFallbackStatement(line, lineno, world, simGrid, {
          get x() { return simX; }, set x(v) { simX = v; },
          get y() { return simY; }, set y(v) { simY = v; },
          get dir() { return simDir; }, set dir(v) { simDir = v; },
          cargo: simCargo,
          systems: simSystems,
          battery: simBattery
        }, recordedActions, printOutputs, tileNameMap);

        i++;
      }

      return {
        success: true,
        actions: recordedActions,
        output: printOutputs,
        error: null
      };
    } catch (err) {
      return {
        success: false,
        actions: recordedActions,
        output: printOutputs,
        error: err.message
      };
    }
  }

  evalFallbackStatement(stmt, lineno, world, simGrid, state, recordedActions, printOutputs, tileNameMap) {
    if (stmt.startsWith('rover.move_down()')) {
      state.dir = 'DOWN';
      if (state.y + 1 < world.rows) state.y++;
      recordedActions.push({ action: 'move_down', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.move_up()')) {
      state.dir = 'UP';
      if (state.y - 1 >= 0) state.y--;
      recordedActions.push({ action: 'move_up', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.move_left()')) {
      state.dir = 'LEFT';
      if (state.x - 1 >= 0) state.x--;
      recordedActions.push({ action: 'move_left', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.move_right()')) {
      state.dir = 'RIGHT';
      if (state.x + 1 < world.cols) state.x++;
      recordedActions.push({ action: 'move_right', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.drill()')) {
      let tx = state.x;
      let ty = state.y;
      if (state.dir === 'DOWN') ty++;
      else if (state.dir === 'UP') ty--;
      else if (state.dir === 'RIGHT') tx++;
      else if (state.dir === 'LEFT') tx--;

      if (tx >= 0 && tx < world.cols && ty >= 0 && ty < world.rows) {
        simGrid[ty][tx] = TILES.AIR;
      }
      recordedActions.push({ action: 'drill', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.collect()')) {
      const tile = simGrid[state.y][state.x];
      if (tile === TILES.CRYSTAL_EMERALD) {
        state.cargo.push("Emerald Geode");
        simGrid[state.y][state.x] = TILES.AIR;
      } else if (tile === TILES.CRYSTAL_LITHIUM) {
        state.cargo.push("Lithium Core");
        simGrid[state.y][state.x] = TILES.AIR;
      }
      recordedActions.push({ action: 'collect', lineno, simX: state.x, simY: state.y, simDir: state.dir, simCargo: [...state.cargo], simSystems: { ...state.systems } });
    } else if (stmt.startsWith('rover.systems["torque"] =') || stmt.startsWith("rover.systems['torque'] =")) {
      const val = parseInt(stmt.split('=')[1].trim(), 10) || 90;
      state.systems.torque = val;
    } else if (stmt.startsWith('print(')) {
      printOutputs.push(stmt.replace(/^print\((.*)\)$/, '$1'));
    }
  }

  formatPythonError(err) {
    const raw = String(err);
    // Parse helpful line numbers
    const match = raw.match(/File "<exec>", line (\d+)/);
    if (match) {
      return `Line ${match[1]}: ${raw.split('\n').slice(-2).join(' ')}`;
    }
    return raw;
  }
}
