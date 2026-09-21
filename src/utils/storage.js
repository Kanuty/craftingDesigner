// Default presets for game crafting systems

export const PRESETS = {
  rpg: {
    id: 'rpg',
    name: 'RPG Crafting',
    description: 'Alchemy potions, oils, and hero gear with workstation and skill conditions.',
    items: [
      { id: 'celandine', name: 'Celandine', category: 'Raw', icon: 'Leaf', description: 'Common yellow herb used in healing potions.', tier: 1, tags: ['#plants', '#herb', '#raw'] },
      { id: 'drowner_brain', name: 'Drowner Brain', category: 'Raw', icon: 'Skull', description: 'Monster component harvested from drowners.', tier: 1, tags: ['#monster', '#trash', '#raw'] },
      { id: 'dwarven_spirit', name: 'Dwarven Spirit', category: 'Intermediate', icon: 'Wine', description: 'Strong alcohol base for alchemy potions.', tier: 1, tags: ['#liquid', '#fuel'] },
      { id: 'silver_ore', name: 'Silver Ore', category: 'Raw', icon: 'Gem', description: 'Raw silver mined from mountains.', tier: 1, tags: ['#ore', '#mined', '#raw'] },
      { id: 'dark_iron_ore', name: 'Dark Iron Ore', category: 'Raw', icon: 'Mountain', description: 'Rare dark iron ore for advanced forging.', tier: 2, tags: ['#ore', '#mined', '#raw'] },
      { id: 'silver_ingot', name: 'Silver Ingot', category: 'Intermediate', icon: 'Box', description: 'Refined silver ingot.', tier: 1, tags: ['#metal', '#intermediate'] },
      { id: 'dark_iron_ingot', name: 'Dark Iron Ingot', category: 'Intermediate', icon: 'Shield', description: 'High durability dark iron ingot.', tier: 2, tags: ['#metal', '#intermediate'] },
      { id: 'monster_bone', name: 'Monster Bone', category: 'Raw', icon: 'Bone', description: 'Dense monster bone for crafting weapon hilts.', tier: 2, tags: ['#bone', '#trash'] },
      { id: 'swallow_potion', name: 'Swallow Potion', category: 'Finished', icon: 'FlaskConical', description: 'Accelerates vital regeneration.', tier: 1, tags: ['#potion', '#finished'] },
      { id: 'master_silver_sword', name: 'Mastercrafted Silver Sword', category: 'Finished', icon: 'Sword', description: 'Deadly blade effective against monsters.', tier: 3, tags: ['#weapon', '#gear'] }
    ],
    conditions: [
      { id: 'alchemy_table', name: 'Alchemy Workbench', type: 'workstation', level: 'Basic', description: 'Required for compounding potion ingredients.', icon: 'FlaskRound', fuelItemId: 'dwarven_spirit', fuelQuantity: 1 },
      { id: 'master_forge', name: 'Master Blacksmith Forge', type: 'workstation', level: 'Master Tier', description: 'High temperature forge needed for master weaponry.', icon: 'Anvil', fuelItemId: '', fuelQuantity: 0 },
      { id: 'herbalism_1', name: 'Herbalism Skill', type: 'skill', level: 'Level 1', description: 'Knowledge of basic plant properties.', icon: 'GraduationCap', fuelItemId: '', fuelQuantity: 0 },
      { id: 'witcher_crafting_3', name: 'Master Crafting', type: 'skill', level: 'Level 3', description: 'Mastery in heroic gear crafting.', icon: 'Award', fuelItemId: '', fuelQuantity: 0 }
    ],
    recipes: [
      {
        id: 'recipe_silver_ingot',
        name: 'Smelt Silver Ingot',
        outputItemId: 'silver_ingot',
        outputQuantity: 1,
        craftTimeSeconds: 5,
        inputs: [{ itemId: 'silver_ore', quantity: 2 }],
        conditionIds: ['master_forge'],
        notes: 'Standard silver smelting.'
      },
      {
        id: 'recipe_dark_iron_ingot',
        name: 'Smelt Dark Iron Ingot',
        outputItemId: 'dark_iron_ingot',
        outputQuantity: 1,
        craftTimeSeconds: 10,
        inputs: [{ itemId: 'dark_iron_ore', quantity: 3 }],
        conditionIds: ['master_forge'],
        notes: 'Requires intense heat.'
      },
      {
        id: 'recipe_swallow',
        name: 'Brew Swallow Potion',
        outputItemId: 'swallow_potion',
        outputQuantity: 1,
        craftTimeSeconds: 3,
        inputs: [
          { itemId: 'celandine', quantity: 2 },
          { itemId: 'drowner_brain', quantity: 1 },
          { itemId: 'dwarven_spirit', quantity: 1 }
        ],
        conditionIds: ['alchemy_table', 'herbalism_1'],
        notes: 'Core RPG healing potion.'
      },
      {
        id: 'recipe_silver_sword',
        name: 'Forge Mastercrafted Silver Sword',
        outputItemId: 'master_silver_sword',
        outputQuantity: 1,
        craftTimeSeconds: 15,
        inputs: [
          { itemId: 'silver_ingot', quantity: 3 },
          { itemId: 'dark_iron_ingot', quantity: 2 },
          { itemId: 'monster_bone', quantity: 1 }
        ],
        conditionIds: ['master_forge', 'witcher_crafting_3'],
        notes: 'High tier RPG blade.'
      }
    ]
  },
  crafter: {
    id: 'crafter',
    name: 'Crafter Automation',
    description: 'Factory production lines with furnaces, assembling machines, and tech research requirements.',
    items: [
      { id: 'iron_ore', name: 'Iron Ore', category: 'Raw', icon: 'Mountain', description: 'Mined iron ore.', tier: 1, tags: ['#ore', '#mined', '#raw'] },
      { id: 'copper_ore', name: 'Copper Ore', category: 'Raw', icon: 'Gem', description: 'Mined copper ore.', tier: 1, tags: ['#ore', '#mined', '#raw'] },
      { id: 'coal', name: 'Coal', category: 'Raw', icon: 'Flame', description: 'Fuel source.', tier: 1, tags: ['#fuel', '#ore', '#raw'] },
      { id: 'iron_plate', name: 'Iron Plate', category: 'Intermediate', icon: 'Box', description: 'Basic smelting output for iron.', tier: 1, tags: ['#metal', '#intermediate'] },
      { id: 'copper_plate', name: 'Copper Plate', category: 'Intermediate', icon: 'Box', description: 'Basic smelting output for copper.', tier: 1, tags: ['#metal', '#intermediate'] },
      { id: 'copper_cable', name: 'Copper Cable', category: 'Intermediate', icon: 'Zap', description: 'Used for electrical components.', tier: 1, tags: ['#component', '#intermediate'] },
      { id: 'iron_gear', name: 'Iron Gear Wheel', category: 'Intermediate', icon: 'Cog', description: 'Mechanical component.', tier: 1, tags: ['#component', '#intermediate'] },
      { id: 'green_chip', name: 'Electronic Circuit', category: 'Intermediate', icon: 'Cpu', description: 'Basic automation circuit board.', tier: 2, tags: ['#electronics', '#component'] },
      { id: 'steel_plate', name: 'Steel Plate', category: 'Intermediate', icon: 'Shield', description: 'High strength steel alloy.', tier: 2, tags: ['#metal', '#intermediate'] },
      { id: 'red_science', name: 'Automation Science Pack', category: 'Finished', icon: 'FlaskConical', description: 'Red science pack for early research.', tier: 1, tags: ['#science', '#finished'] },
      { id: 'green_science', name: 'Logistic Science Pack', category: 'Finished', icon: 'FlaskRound', description: 'Green science pack for logistics research.', tier: 2, tags: ['#science', '#finished'] }
    ],
    conditions: [
      { id: 'stone_furnace', name: 'Stone Furnace', type: 'workstation', level: 'Tier 1', description: 'Basic furnace fueled by coal.', icon: 'Flame', fuelItemId: 'coal', fuelQuantity: 1 },
      { id: 'steel_furnace', name: 'Steel Furnace', type: 'workstation', level: 'Tier 2', description: 'Double speed furnace.', icon: 'Zap', fuelItemId: 'coal', fuelQuantity: 1 },
      { id: 'assembler_1', name: 'Assembling Machine 1', type: 'workstation', level: 'Tier 1', description: 'Automates basic recipes.', icon: 'Cog', fuelItemId: '', fuelQuantity: 0 },
      { id: 'electronics_tech', name: 'Electronics Tech', type: 'skill', level: 'Researched', description: 'Unlocks circuit components.', icon: 'Cpu', fuelItemId: '', fuelQuantity: 0 },
      { id: 'steel_processing_tech', name: 'Steel Processing Tech', type: 'skill', level: 'Researched', description: 'Unlocks steel smelting.', icon: 'Award', fuelItemId: '', fuelQuantity: 0 }
    ],
    recipes: [
      {
        id: 'recipe_iron_plate',
        name: 'Smelt Iron Plate',
        outputItemId: 'iron_plate',
        outputQuantity: 1,
        craftTimeSeconds: 3.2,
        inputs: [{ itemId: 'iron_ore', quantity: 1 }, { itemId: 'coal', quantity: 1 }],
        conditionIds: ['stone_furnace'],
        notes: 'Basic smelting.'
      },
      {
        id: 'recipe_copper_plate',
        name: 'Smelt Copper Plate',
        outputItemId: 'copper_plate',
        outputQuantity: 1,
        craftTimeSeconds: 3.2,
        inputs: [{ itemId: 'copper_ore', quantity: 1 }, { itemId: 'coal', quantity: 1 }],
        conditionIds: ['stone_furnace'],
        notes: 'Basic smelting.'
      },
      {
        id: 'recipe_copper_cable',
        name: 'Craft Copper Cable',
        outputItemId: 'copper_cable',
        outputQuantity: 2,
        craftTimeSeconds: 0.5,
        inputs: [{ itemId: 'copper_plate', quantity: 1 }],
        conditionIds: ['assembler_1'],
        notes: 'Yields 2 cables per plate.'
      },
      {
        id: 'recipe_iron_gear',
        name: 'Craft Iron Gear Wheel',
        outputItemId: 'iron_gear',
        outputQuantity: 1,
        craftTimeSeconds: 0.5,
        inputs: [{ itemId: 'iron_plate', quantity: 2 }],
        conditionIds: ['assembler_1'],
        notes: 'Used in machinery.'
      },
      {
        id: 'recipe_green_chip',
        name: 'Craft Electronic Circuit',
        outputItemId: 'green_chip',
        outputQuantity: 1,
        craftTimeSeconds: 0.5,
        inputs: [
          { itemId: 'copper_cable', quantity: 3 },
          { itemId: 'iron_plate', quantity: 1 }
        ],
        conditionIds: ['assembler_1', 'electronics_tech'],
        notes: 'Essential component.'
      },
      {
        id: 'recipe_steel_plate',
        name: 'Smelt Steel Plate',
        outputItemId: 'steel_plate',
        outputQuantity: 1,
        craftTimeSeconds: 16,
        inputs: [{ itemId: 'iron_plate', quantity: 5 }],
        conditionIds: ['steel_furnace', 'steel_processing_tech'],
        notes: 'Requires 5 iron plates.'
      },
      {
        id: 'recipe_red_science',
        name: 'Craft Automation Science Pack',
        outputItemId: 'red_science',
        outputQuantity: 1,
        craftTimeSeconds: 5,
        inputs: [
          { itemId: 'copper_plate', quantity: 1 },
          { itemId: 'iron_gear', quantity: 1 }
        ],
        conditionIds: ['assembler_1'],
        notes: 'Red science pack.'
      }
    ]
  }
};

const STORAGE_KEY = 'crafting_designer_data_v2';
const CUSTOM_PRESETS_KEY = 'crafting_designer_custom_presets_v2';

export function loadDataFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.items && parsed.conditions && parsed.recipes) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load storage data:', err);
  }
  // Default to RPG preset if nothing saved
  return PRESETS.rpg;
}

export function saveDataToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save storage data:', err);
  }
}

export function loadCustomPresets() {
  try {
    const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load custom presets:', err);
  }
  return {};
}

export function saveCustomPreset(presetName, data) {
  const custom = loadCustomPresets();
  const id = `custom_${Date.now()}`;
  custom[id] = {
    id,
    name: presetName,
    description: 'User created custom preset',
    items: data.items,
    conditions: data.conditions,
    recipes: data.recipes
  };
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));
  } catch (err) {
    console.error('Failed to save custom preset:', err);
  }
  return custom;
}

export function deleteCustomPreset(id) {
  const custom = loadCustomPresets();
  delete custom[id];
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));
  } catch (err) {
    console.error('Failed to delete custom preset:', err);
  }
  return custom;
}
