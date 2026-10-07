// ==============================================================================
// PYTHON PIT // SUBTERRANEAN STRATA & ROVER STATE ENGINE
// ==============================================================================

export const TILES = {
  AIR: 0,
  DIRT: 1,             // Soft loam / topsoil
  BASALT: 2,           // Dense fractured rock
  MAGMA: 3,            // Thermal hazard
  CRYSTAL_LITHIUM: 4,  // Electric cyan ore
  CRYSTAL_EMERALD: 5,  // Radiant green geode
  POWER_CELL: 6,       // Energy core (+50 battery)
  DROP_POD: 7,         // Extraction chute / goal
  BEDROCK: 8,          // Indestructible border rock
  TITANIUM_ARMOR: 9    // Heavy blast door (requires systems['torque'] >= 80)
};

export class SubterraneanWorld {
  constructor(levelData) {
    this.level = levelData;
    this.cols = levelData.cols || 10;
    this.rows = levelData.rows || 14;
    this.grid = [];
    this.rover = {
      x: 0,
      y: 0,
      dir: 'DOWN',        // 'DOWN', 'RIGHT', 'LEFT', 'UP'
      battery: 100,
      maxBattery: 100,
      cargo: [],          // Python list of strings
      systems: {          // Python dict
        torque: 40,
        shield: 100
      },
      drilling: false,
      scanning: false,
      scanDir: null
    };
    this.history = [];
    this.initFromLevel(levelData);
  }

  initFromLevel(levelData) {
    this.level = levelData;
    this.cols = levelData.cols || 10;
    this.rows = levelData.rows || 14;
    this.grid = [];

    // Clone 2D grid matrix
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(levelData.map[r] ? levelData.map[r][c] : TILES.DIRT);
      }
      this.grid.push(row);
    }

    // Reset Rover
    this.rover.x = levelData.spawn.x;
    this.rover.y = levelData.spawn.y;
    this.rover.dir = levelData.spawn.dir || 'DOWN';
    this.rover.battery = 100;
    this.rover.cargo = [];
    this.rover.systems = { torque: 40, shield: 100 };
    this.rover.drilling = false;
    this.rover.scanning = false;
    this.rover.scanDir = null;
    this.history = [];
  }

  getTile(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return TILES.BEDROCK;
    }
    return this.grid[y][x];
  }

  setTile(x, y, tile) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.grid[y][x] = tile;
    }
  }

  getFrontCoords(dir = this.rover.dir) {
    let dx = 0;
    let dy = 0;
    if (dir === 'DOWN') dy = 1;
    else if (dir === 'UP') dy = -1;
    else if (dir === 'RIGHT') dx = 1;
    else if (dir === 'LEFT') dx = -1;
    return { x: this.rover.x + dx, y: this.rover.y + dy };
  }

  canMoveTo(x, y) {
    const tile = this.getTile(x, y);
    // Can move into AIR, CRYSTAL, POWER_CELL, DROP_POD
    return (
      tile === TILES.AIR ||
      tile === TILES.CRYSTAL_LITHIUM ||
      tile === TILES.CRYSTAL_EMERALD ||
      tile === TILES.POWER_CELL ||
      tile === TILES.DROP_POD
    );
  }

  getDepthMeters() {
    return Math.max(0, this.rover.y * 50);
  }

  checkObjectives() {
    if (!this.level || !this.level.checkWin) return false;
    return this.level.checkWin(this);
  }
}
