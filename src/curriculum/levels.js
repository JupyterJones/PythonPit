// ==============================================================================
// PYTHON PIT // 10 STRATA SECTORS CURRICULUM ARCHITECTURE
// Comprehensive Python Progression: Sector 0 -> Sector 9
// ==============================================================================

import { TILES } from '../world.js';

export const LEVELS = [
  // --------------------------------------------------------------------------
  // SECTOR 0: CALIBRATION DROP
  // --------------------------------------------------------------------------
  {
    id: 0,
    title: "Sector 0: Calibration Drop",
    subtitle: "The Basics // Sequential Execution",
    strata: "Sub-Surface Loam (0m - 150m)",
    badge: "BEGINNER",
    cols: 7,
    rows: 8,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 5, 8, 8, 8], // Emerald at (3, 4)
      [8, 8, 8, 7, 8, 8, 8], // Drop pod at (3, 5)
      [8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Drill through the 3 layers of soft loam dirt",
      "Collect the rare Emerald Geode",
      "Dock inside the Drop Pod at Depth 250m"
    ],
    starterCode: `# ==========================================================
# SECTOR 0: CALIBRATION DROP
# Learn: Sequential method calls in Python.
# Commands available:
#   rover.drill()      - Drills the tile in front of the rover
#   rover.move_down()  - Moves the rover down 1 tile
#   rover.collect()    - Collects crystals or items
# ==========================================================

# 1. Drill and move down through the loam
rover.drill()
rover.move_down()

# TODO: Drill the remaining layers, collect the emerald,
# and reach the Drop Pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Drill layer 1
rover.drill()
rover.move_down()

# Drill layer 2
rover.drill()
rover.move_down()

# Drill layer 3
rover.drill()
rover.move_down()

# Move onto the Emerald Geode and collect it
rover.move_down()
rover.collect()

# Enter the extraction Drop Pod!
rover.move_down()
`,
    hints: [
      "Python executes code line-by-line from top to bottom.",
      "You cannot move into a dirt block until you drill it first!",
      "Don't forget rover.collect() when you reach the glowing green crystal."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 5;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      if (atPod && hasEmerald) {
        return { won: true, message: "Calibration complete! Emerald secured in pod." };
      }
      if (atPod && !hasEmerald) {
        return { won: false, message: "Docked at pod, but you forgot to rover.collect() the emerald!" };
      }
      return { won: false, message: "Drill downward and dock the rover at the Drop Pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 1: BASALT TRENCH
  // --------------------------------------------------------------------------
  {
    id: 1,
    title: "Sector 1: Basalt Trench",
    subtitle: "Iteration // 'for' Loops & range()",
    strata: "Fractured Basalt Band (350m - 700m)",
    badge: "LOOPS",
    cols: 7,
    rows: 10,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 2, 8, 8, 8],
      [8, 8, 8, 4, 8, 8, 8], // Lithium at (3, 7)
      [8, 8, 8, 7, 8, 8, 8], // Drop pod at (3, 8)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Drill through 6 thick layers of dense Basalt",
      "Use a 'for' loop with range() to avoid repeating code",
      "Collect the Lithium core and reach the pod"
    ],
    starterCode: `# ==========================================================
# SECTOR 1: BASALT TRENCH
# Learn: 'for' loops in Python.
# Instead of writing rover.drill() 6 times, use a loop!
# Notice Python's indentation (4 spaces inside the loop block).
# ==========================================================

# Loop 6 times to blast through the basalt strata:
for layer in range(6):
    rover.drill()
    rover.move_down()

# TODO: Collect the Lithium ore and dock in the pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Use a for loop to drill through all 6 basalt layers
for layer in range(6):
    rover.drill()
    rover.move_down()

# Move onto the Lithium crystal and collect it
rover.move_down()
rover.collect()

# Enter the extraction pod
rover.move_down()
`,
    hints: [
      "Python uses indentation (4 spaces) to define what is inside a loop.",
      "range(6) repeats the indented block exactly 6 times.",
      "Put rover.collect() after the loop finishes."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 8;
      const hasLithium = world.rover.cargo.includes("Lithium Core");
      if (atPod && hasLithium) {
        return { won: true, message: "Basalt trench cleared with automated loop!" };
      }
      return { won: false, message: "Clear the 6 basalt layers with your loop and collect the Lithium!" };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 2: MAGMA FAULT LINE
  // --------------------------------------------------------------------------
  {
    id: 2,
    title: "Sector 2: Magma Fault Line",
    subtitle: "Conditionals // 'if / else' & Optical Radar",
    strata: "Thermal Mantle Fault (800m - 1200m)",
    badge: "CONDITIONALS",
    cols: 7,
    rows: 9,
    spawn: { x: 2, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 0, 8, 8, 8, 8],
      [8, 8, 1, 8, 8, 8, 8],
      [8, 8, 1, 8, 8, 8, 8],
      [8, 8, 3, 1, 8, 8, 8], // Magma at (2, 3), dirt bypass at (3, 3)
      [8, 8, 8, 1, 8, 8, 8], // Dirt below bypass at (3, 4)
      [8, 8, 1, 1, 8, 8, 8], // Dirt at (2, 5) and (3, 5)
      [8, 8, 5, 8, 8, 8, 8], // Emerald at (2, 6)
      [8, 8, 7, 8, 8, 8, 8], // Drop pod at (2, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Use rover.scan_down() to check strata ahead",
      "Use 'if' statements to detect 'MAGMA'",
      "Bypass the magma fissure safely without melting"
    ],
    starterCode: `# ==========================================================
# SECTOR 2: MAGMA FAULT LINE
# Learn: Conditionals 'if' and 'else'.
# Commands available:
#   rover.scan_down()  - Returns tile type: 'DIRT', 'MAGMA', 'AIR'
#   rover.move_right() / rover.move_left() / rover.move_down()
# ==========================================================

for step in range(3):
    scan_result = rover.scan_down()
    print("Scan at depth:", scan_result)
    
    if scan_result == "MAGMA":
        # Magma alert! Step right to bypass the fissure
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# TODO: Clear the remaining strata, collect the Emerald,
# and dock in the drop pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
for step in range(3):
    sensor = rover.scan_down()
    if sensor == "MAGMA":
        # Bypass around molten magma
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# Clear remaining layer to reach emerald
rover.drill()
rover.move_down()

# Move onto emerald, collect, and dock
rover.move_down()
rover.collect()
rover.move_down()
`,
    hints: [
      "rover.scan_down() reads the tile directly below without drilling it.",
      "If you drill or step into MAGMA, the rover triggers emergency shutdown!",
      "Use 'if scan_result == \"MAGMA\":' to divert path."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 2 && world.rover.y === 7;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      if (atPod && hasEmerald) {
        return { won: true, message: "Magma successfully avoided using sensor conditionals!" };
      }
      return { won: false, message: "Navigate around the magma hazard and reach the pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 3: GEODE CAVERN
  // --------------------------------------------------------------------------
  {
    id: 3,
    title: "Sector 3: Geode Cavern",
    subtitle: "Data Structures // Python Lists & len()",
    strata: "Crystalline Pocket (1500m - 2000m)",
    badge: "LISTS",
    cols: 7,
    rows: 9,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 4, 8], // Lithium at (1, 2) and (5, 2)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 4, 8], // Lithium at (1, 4) and (5, 4)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 6, 8, 8, 8], // Power cell at (3, 6)
      [8, 8, 8, 7, 8, 8, 8], // Drop pod at (3, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Collect at least 3 Lithium Crystals",
      "Track your inventory using Python's list: rover.cargo",
      "Inspect len(rover.cargo) before docking"
    ],
    starterCode: `# ==========================================================
# SECTOR 3: GEODE CAVERN
# Learn: Python lists and len().
# Your rover tracks collected samples in a real Python list:
#   rover.cargo -> ['Lithium Core', ...]
#   len(rover.cargo) -> Number of items in cargo
# ==========================================================

# Move down into the cavern
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Branch left to harvest mineral alcove 1
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

print("Current Cargo List:", rover.cargo)
print("Items Collected:", len(rover.cargo))

# TODO: Harvest more alcoves until len(rover.cargo) >= 3,
# grab the Power Cell, and dock in the pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Clear shaft down to first tier
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Alcove 1 (Left)
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

# Alcove 2 (Right)
rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# Move down to tier 2
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Alcove 3 (Left)
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

# Recharge power cell & dock
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
`,
    hints: [
      "rover.cargo is a Python list containing strings of collected items.",
      "len(rover.cargo) counts how many items you have secured.",
      "You need at least 3 Lithium Cores to fulfill the quota."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 7;
      const count = world.rover.cargo.filter(i => i.includes("Lithium")).length;
      if (atPod && count >= 3) {
        return { won: true, message: `Mission quota exceeded! ${count} Lithium cores secured.` };
      }
      if (atPod && count < 3) {
        return { won: false, message: `Only collected ${count}/3 Lithium cores. Need at least 3!` };
      }
      return { won: false, message: "Collect at least 3 Lithium cores and dock in the drop pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 4: REACTOR POWER MATRIX
  // --------------------------------------------------------------------------
  {
    id: 4,
    title: "Sector 4: Reactor Power Matrix",
    subtitle: "Data Structures // Python Dictionaries (dict)",
    strata: "Subterranean Fortress Vault (2500m - 3200m)",
    badge: "DICTIONARIES",
    cols: 7,
    rows: 9,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 9, 8, 8, 8], // Titanium Armor Door (requires torque >= 80)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 9, 8, 8, 8], // Second Titanium Door
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 5, 8, 8, 8], // Emerald Geode
      [8, 8, 8, 7, 8, 8, 8], // Drop pod at (3, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Access the rover's configuration dictionary: rover.systems",
      "Overclock drill torque by setting rover.systems['torque'] = 90",
      "Breach two Titanium Armor blast doors and secure the vault"
    ],
    starterCode: `# ==========================================================
# SECTOR 4: REACTOR POWER MATRIX
# Learn: Python dictionaries (key-value mappings).
# The rover's hardware settings are stored in a dictionary:
#   rover.systems = {'torque': 40, 'shield': 100}
# Normal torque (40) cannot penetrate Titanium Armor doors!
# Overclock torque to 90 to shatter blast doors.
# ==========================================================

# 1. Inspect initial systems dictionary
print("Default Systems:", rover.systems)

# 2. Overclock torque key in the dictionary:
rover.systems["torque"] = 90
print("Overclocked Systems:", rover.systems)

# 3. Drill through the loam and blast through the armor door!
rover.drill()
rover.move_down()
rover.drill() # Powerful enough to crush titanium!
rover.move_down()

# TODO: Clear the remaining strata, shatter door 2,
# and collect the Vault Emerald!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Overclock torque dictionary setting
rover.systems["torque"] = 90

for step in range(5):
    rover.drill()
    rover.move_down()

# Move onto emerald, collect, and dock
rover.move_down()
rover.collect()
rover.move_down()
`,
    hints: [
      "In Python, dictionaries store key-value pairs: my_dict['key'] = new_value.",
      "If rover.systems['torque'] < 80, the drill will bounce harmlessly off titanium armor.",
      "With torque >= 80, the diamond bit shatters titanium easily."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 7;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      if (atPod && hasEmerald) {
        return { won: true, message: "Titanium vault breached via Python dictionary manipulation!" };
      }
      return { won: false, message: "Overclock torque to 90, breach both doors, and secure the vault emerald." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 5: CORE EXTRACTION PROTOCOL
  // --------------------------------------------------------------------------
  {
    id: 5,
    title: "Sector 5: Core Extraction Protocol",
    subtitle: "Modularity // Functions & Subroutines",
    strata: "Planetary Core Mantle (3400m - 4000m)",
    badge: "FUNCTIONS",
    cols: 7,
    rows: 10,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 5, 8], // Left alcove Lithium, Right alcove Emerald
      [8, 8, 8, 1, 8, 8, 8],
      [8, 5, 1, 1, 1, 4, 8], // Left alcove Emerald, Right alcove Lithium
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 5, 8], // Left alcove Lithium, Right alcove Emerald
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 7, 8, 8, 8], // Drop pod at (3, 8)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Define reusable Python functions (def harvest_tier(): ...)",
      "Clear all 3 branching chambers with zero duplicated code",
      "Collect at least 4 crystals and reach the Planetary Core Pod"
    ],
    starterCode: `# ==========================================================
# SECTOR 5: CORE EXTRACTION PROTOCOL
# Learn: Python functions (def keyword).
# Functions encapsulate reusable subroutines.
# Define functions to harvest left and right alcoves cleanly!
# ==========================================================

def harvest_tier():
    # Clear left alcove
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    
    # Clear right alcove
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Tier 1
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
harvest_tier()

# TODO: Clear Tiers 2 and 3 using your function in a loop,
# then dock at the Planetary Core Pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
def harvest_tier():
    # Clear left alcove
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    
    # Clear right alcove
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Traverse through 3 tiers of the planetary core
for tier in range(3):
    rover.drill()
    rover.move_down()
    rover.drill()
    rover.move_down()
    harvest_tier()

# Dock in pod
rover.drill()
rover.move_down()
rover.move_down()
`,
    hints: [
      "Functions start with 'def name():' followed by an indented block of code.",
      "Calling harvest_tier() runs all its internal instructions in one neat line.",
      "Combine functions with a 'for' loop for maximum elegance!"
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 8;
      const count = world.rover.cargo.length;
      if (atPod && count >= 4) {
        return { won: true, message: `PLANETARY CORE BREACHED! ${count} rare crystals extracted with modular code!` };
      }
      if (atPod && count < 4) {
        return { won: false, message: `Only collected ${count} crystals. Harvest more alcoves using your functions!` };
      }
      return { won: false, message: "Harvest the cavern alcoves with functions and dock in the pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 6: ELECTROMAGNETIC VOID
  // --------------------------------------------------------------------------
  {
    id: 6,
    title: "Sector 6: Electromagnetic Void",
    subtitle: "State Loops // 'while' Loops & Energy Systems",
    strata: "Electromagnetic Void (4100m - 4700m)",
    badge: "WHILE LOOPS",
    cols: 7,
    rows: 9,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 6, 8, 8, 8], // Power Cell 1 at (3, 2)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 6, 8, 8, 8], // Power Cell 2 at (3, 4)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 5, 8, 8, 8], // Emerald at (3, 6)
      [8, 8, 8, 7, 8, 8, 8], // Drop Pod at (3, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Use a 'while' loop to drill down until reaching Depth 300m",
      "Recharge your batteries at both Power Cells",
      "Collect the Void Emerald and dock in the pod"
    ],
    starterCode: `# ==========================================================
# SECTOR 6: ELECTROMAGNETIC VOID
# Learn: 'while' loops in Python.
# A 'while' loop continues running as long as a condition is True:
#   while rover.y < 6:
#       rover.drill()
#       rover.move_down()
# ==========================================================

# Drill downward while above the target depth
while rover.y < 6:
    rover.drill()
    rover.move_down()
    rover.collect() # Automatically grabs power cells along the way!

# TODO: Collect the Emerald and dock in the Drop Pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Use a while loop to navigate down until depth y reaches 6
while rover.y < 6:
    rover.drill()
    rover.move_down()
    rover.collect() # Scoops up power cells to keep batteries full

# At emerald geode
rover.collect()
rover.move_down()
`,
    hints: [
      "A while loop repeats continuously until its condition evaluates to False.",
      "Make sure you advance rover.move_down() inside the loop to avoid infinite loops!",
      "rover.collect() picks up Power Cells (+50% battery) and gems alike."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 7;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      if (atPod && hasEmerald) {
        return { won: true, message: "Electromagnetic Void crossed with automated while loop!" };
      }
      return { won: false, message: "Recharge at power cells, secure the emerald, and dock at the pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 7: MINERAL SIFTER
  // --------------------------------------------------------------------------
  {
    id: 7,
    title: "Sector 7: Mineral Sifter",
    subtitle: "Collections // List Comprehensions & Filtering",
    strata: "Radioactive Slag Vein (4800m - 5400m)",
    badge: "LIST COMPS",
    cols: 7,
    rows: 9,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 5, 8], // Lithium at (1, 2), Emerald at (5, 2)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 5, 1, 1, 1, 4, 8], // Emerald at (1, 4), Lithium at (5, 4)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 5, 8, 8, 8], // Emerald at (3, 6)
      [8, 8, 8, 7, 8, 8, 8], // Drop Pod at (3, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Harvest minerals from side alcoves",
      "Filter for Emeralds using list comprehension: [x for x in rover.cargo if 'Emerald' in x]",
      "Deliver at least 2 Emeralds to the extraction pod"
    ],
    starterCode: `# ==========================================================
# SECTOR 7: MINERAL SIFTER
# Learn: Python List Comprehensions!
# A list comprehension filters and transforms collections in one line:
#   emeralds = [item for item in rover.cargo if "Emerald" in item]
# ==========================================================

# Clear down to tier 1
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Grab left lithium and right emerald
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# Filter collected emeralds
emeralds = [item for item in rover.cargo if "Emerald" in item]
print("Filtered Emeralds:", emeralds)

# TODO: Harvest tier 2, filter cargo, and dock in the pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
def harvest_tier():
    # Left pocket
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    # Right pocket
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Clear both tiers
for _ in range(2):
    rover.drill()
    rover.move_down()
    rover.drill()
    rover.move_down()
    harvest_tier()

# Sift cargo with list comprehension
emeralds = [c for c in rover.cargo if "Emerald" in c]
print("Total Pure Emeralds Found:", len(emeralds))

# Dock at pod
rover.drill()
rover.move_down()
rover.collect()
rover.move_down()
`,
    hints: [
      "List comprehension syntax: [item for item in list if condition].",
      "rover.cargo contains strings like 'Emerald Geode' and 'Lithium Core'.",
      "Ensure you dock at the pod with at least 2 Emeralds secured."
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 7;
      const emeralds = world.rover.cargo.filter(c => c.includes("Emerald"));
      if (atPod && emeralds.length >= 2) {
        return { won: true, message: `Pure minerals purified! ${emeralds.length} Emeralds secured.` };
      }
      return { won: false, message: `Collect at least 2 Emeralds and dock in the pod.` };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 8: OBSIDIAN LABYRINTH
  // --------------------------------------------------------------------------
  {
    id: 8,
    title: "Sector 8: Obsidian Labyrinth",
    subtitle: "Data Structures // Tuples & Waypoint Navigation",
    strata: "Dense Obsidian Columns (5500m - 6200m)",
    badge: "TUPLES & PATHS",
    cols: 7,
    rows: 9,
    spawn: { x: 1, y: 0, dir: 'DOWN' },
    map: [
      [8, 0, 8, 8, 8, 8, 8],
      [8, 1, 8, 8, 8, 8, 8],
      [8, 1, 1, 1, 8, 8, 8], // Path jogs right to (3, 2)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 1, 1, 1, 8], // Path jogs right to (5, 4)
      [8, 8, 8, 8, 8, 1, 8],
      [8, 8, 8, 8, 8, 5, 8], // Emerald at (5, 6)
      [8, 8, 8, 8, 8, 7, 8], // Drop Pod at (5, 7)
      [8, 8, 8, 8, 8, 8, 8]
    ],
    objectives: [
      "Navigate the winding obsidian zigzag shaft",
      "Store navigation steps as Python tuples: ('DIR', count)",
      "Iterate over your waypoint list to clear the maze"
    ],
    starterCode: `# ==========================================================
# SECTOR 8: OBSIDIAN LABYRINTH
# Learn: Python Tuples and Path Lists.
# Tuples are immutable pairs: ("DOWN", 2), ("RIGHT", 2)
# Loop through a list of waypoints to pilot through the labyrinth!
# ==========================================================

# Define your route as a list of direction-count tuples:
route = [
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2)
]

for direction, distance in route:
    print("Navigating:", direction, distance)
    for _ in range(distance):
        rover.drill()
        if direction == "DOWN":
            rover.move_down()
        elif direction == "RIGHT":
            rover.move_right()

# TODO: Collect the Emerald and dock into the pod!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# Define navigation waypoints as (direction, steps) tuples
route = [
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2)
]

for direction, steps in route:
    for _ in range(steps):
        rover.drill()
        if direction == "DOWN":
            rover.move_down()
        elif direction == "RIGHT":
            rover.move_right()

# Collect the Obsidian Vault Emerald
rover.collect()

# Enter the extraction pod
rover.move_down()
`,
    hints: [
      "Tuples are written with parentheses: ('DOWN', 2).",
      "You can unpack tuples directly in a for loop: 'for direction, steps in route:'.",
      "Follow the path carefully to avoid drilling into indestructible bedrock!"
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 5 && world.rover.y === 7;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      if (atPod && hasEmerald) {
        return { won: true, message: "Obsidian labyrinth charted with tuple waypoint routing!" };
      }
      return { won: false, message: "Follow the waypoint route, collect the emerald, and dock at the pod." };
    }
  },

  // --------------------------------------------------------------------------
  // SECTOR 9: THE PLANETARY SINGULARITY
  // --------------------------------------------------------------------------
  {
    id: 9,
    title: "Sector 9: The Planetary Singularity",
    subtitle: "The Master Protocol // Autonomous Object-Oriented Rover",
    strata: "Planetary Singularity Core (7000m+)",
    badge: "MASTER PROTOCOL",
    cols: 7,
    rows: 10,
    spawn: { x: 3, y: 0, dir: 'DOWN' },
    map: [
      [8, 8, 8, 0, 8, 8, 8],
      [8, 8, 8, 9, 8, 8, 8], // Titanium blast gate (torque >= 80)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 3, 1, 8, 8, 8], // Magma fissure at (2, 3), dirt bypass at (3, 3)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 4, 1, 1, 1, 4, 8], // Lithium cores at (1, 5) and (5, 5)
      [8, 8, 8, 1, 8, 8, 8],
      [8, 8, 8, 9, 8, 8, 8], // Second Titanium gate
      [8, 8, 8, 5, 8, 8, 8], // Ancient Singularity Core Emerald
      [8, 8, 8, 7, 8, 8, 8]  // Master Extraction Pod at (3, 9)
    ],
    objectives: [
      "Overclock systems['torque'] to 90 to pierce Titanium gates",
      "Avoid magma fissures using optical radar scans",
      "Harvest both Lithium power cores and extract the Singularity Relic",
      "Dock into the Master Extraction Pod at the center of the planet!"
    ],
    starterCode: `# ==========================================================
# SECTOR 9: THE PLANETARY SINGULARITY (THE GRAND FINALE)
# Combine everything you've learned:
#   - Dictionaries: rover.systems['torque'] = 90
#   - Conditionals & Scans: rover.scan_down()
#   - Functions: def clear_alcoves():
#   - Loops: for step in range(...):
# ==========================================================

# 1. Overclock torque for titanium blast doors
rover.systems["torque"] = 90

# 2. Breach gate 1
rover.drill()
rover.move_down()

# TODO: Write an autonomous master routine to bypass magma,
# harvest the cores, shatter the final blast door,
# and extract the Planetary Singularity!
`,
    demoCode: `# --- OPTIMAL PYTHON SOLUTION ---
# 1. Overclock drill torque
rover.systems["torque"] = 90

# 2. Breach top gate
rover.drill()
rover.move_down()

# 3. Navigate past magma bypass
for step in range(3):
    sensor = rover.scan_down()
    if sensor == "MAGMA":
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# 4. Harvest alcove crystals
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# 5. Breach gate 2 & extract Singularity
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
rover.collect() # Collect Singularity Emerald
rover.move_down() # Dock in Master Pod!
`,
    hints: [
      "Overclock torque before drilling into titanium armor doors.",
      "Use scan_down() to check for dangerous magma pockets.",
      "Collect all available minerals to complete the ultimate planetary expedition!"
    ],
    checkWin: (world) => {
      const atPod = world.rover.x === 3 && world.rover.y === 9;
      const hasEmerald = world.rover.cargo.includes("Emerald Geode");
      const lithiumCount = world.rover.cargo.filter(c => c.includes("Lithium")).length;
      if (atPod && hasEmerald && lithiumCount >= 2) {
        return { won: true, message: "🏆 PLANETARY SINGULARITY SECURED! You have mastered the Python Pit!" };
      }
      if (atPod && hasEmerald) {
        return { won: true, message: "Singularity reached! Excellent expedition!" };
      }
      return { won: false, message: "Breach the final gate, secure the Singularity Relic, and dock at the core pod." };
    }
  }
];
