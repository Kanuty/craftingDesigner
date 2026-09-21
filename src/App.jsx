import React, { useState, useEffect } from 'react';
import {
  Box, Anvil, Scroll, Calculator, Play, Download, Upload, RotateCcw, Gamepad2, Network,
  Save, Shield, Cpu, Compass
} from 'lucide-react';
import {
  loadDataFromStorage,
  saveDataToStorage,
  PRESETS,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset
} from './utils/storage';
import { ThemeProvider, useTheme } from './utils/theme';
import { ItemManager } from './components/ItemManager';
import { ConditionManager } from './components/ConditionManager';
import { RecipeBuilder } from './components/RecipeBuilder';
import { CraftingCalculator } from './components/CraftingCalculator';
import { CraftingSimulator } from './components/CraftingSimulator';
import TechTreeGraph from './components/TechTreeGraph';

function MainApp() {
  const { themeId, setThemeId, theme } = useTheme();
  const [data, setData] = useState(() => loadDataFromStorage());
  const [customPresets, setCustomPresets] = useState(() => loadCustomPresets());
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes', 'items', 'conditions', 'graphtree', 'calculator', 'simulator'
  const [isCustomPresetModalOpen, setIsCustomPresetModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Persist data on state changes
  useEffect(() => {
    saveDataToStorage(data);
  }, [data]);

  const setItems = (newItems) => {
    setData(prev => ({ ...prev, items: typeof newItems === 'function' ? newItems(prev.items) : newItems }));
  };

  const setConditions = (newConditions) => {
    setData(prev => ({ ...prev, conditions: typeof newConditions === 'function' ? newConditions(prev.conditions) : newConditions }));
  };

  const setRecipes = (newRecipes) => {
    setData(prev => ({ ...prev, recipes: typeof newRecipes === 'function' ? newRecipes(prev.recipes) : newRecipes }));
  };

  const handleLoadPreset = (presetObj, name) => {
    if (presetObj) {
      if (window.confirm(`Load "${name || presetObj.name}" preset? This will replace your current items, conditions, and recipes.`)) {
        setData(presetObj);
      }
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset application to default RPG crafting setup? Current unsaved modifications will be replaced.')) {
      setData(PRESETS.rpg);
    }
  };

  const handleSaveCustomPreset = (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    const updated = saveCustomPreset(newPresetName.trim(), data);
    setCustomPresets(updated);
    setNewPresetName('');
    setIsCustomPresetModalOpen(false);
    alert('Custom preset saved successfully!');
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${data.id || 'crafting_recipes'}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.conditions) && Array.isArray(parsed.recipes)) {
            setData(parsed);
            alert('Crafting system data successfully imported!');
          } else {
            alert('Invalid JSON structure. Must contain items, conditions, and recipes arrays.');
          }
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-mono transition-colors duration-200 ${theme.bg}`}>
      {/* HUD Header Banner */}
      <header className={`sticky top-0 z-40 border-b transition-colors ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${theme.cardBg}`}>
              <Gamepad2 className="w-5 h-5 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest opacity-80 uppercase">/// CRAFT_DESIGNER_SUITE_V2</span>
              </div>
              <h1 className="text-base font-bold my-0 tracking-tight flex items-center gap-2 uppercase font-mono">
                Recipe & Tech Tree Architect
              </h1>
            </div>
          </div>

          {/* Theme Selector & Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Theme Selector */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${theme.cardBg}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1 opacity-75">Theme:</span>
              <button
                onClick={() => setThemeId('blueprint')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  themeId === 'blueprint' ? theme.buttonActive : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Compass className="w-3 h-3" />
                Blueprint
              </button>
              <button
                onClick={() => setThemeId('cyber')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  themeId === 'cyber' ? theme.buttonActive : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Cpu className="w-3 h-3" />
                Cyber-Ops
              </button>
              <button
                onClick={() => setThemeId('military')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  themeId === 'military' ? theme.buttonActive : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Shield className="w-3 h-3" />
                Military
              </button>
            </div>

            {/* Presets */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${theme.cardBg}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1 opacity-75">Preset:</span>
              <button
                onClick={() => handleLoadPreset(PRESETS.rpg, 'RPG Crafting')}
                className={`px-2 py-1 text-xs rounded border ${theme.buttonSecondary}`}
              >
                RPG
              </button>
              <button
                onClick={() => handleLoadPreset(PRESETS.crafter, 'Crafter Automation')}
                className={`px-2 py-1 text-xs rounded border ${theme.buttonSecondary}`}
              >
                Crafter
              </button>

              {/* Custom Presets Dropdown */}
              {Object.keys(customPresets).length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value && customPresets[e.target.value]) {
                      handleLoadPreset(customPresets[e.target.value], customPresets[e.target.value].name);
                      e.target.value = '';
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded border ${theme.inputBg}`}
                  defaultValue=""
                >
                  <option value="" disabled>Saved Presets...</option>
                  {Object.values(customPresets).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setIsCustomPresetModalOpen(true)}
                className={`px-2 py-1 text-xs rounded ${theme.buttonPrimary} flex items-center gap-1`}
                title="Save current state as custom preset"
              >
                <Save className="w-3 h-3" />
                Save
              </button>

              <button
                onClick={handleResetToDefault}
                className={`px-2 py-1 text-xs rounded border ${theme.buttonSecondary} flex items-center gap-1`}
                title="Reset to default RPG state"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Export / Import */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportJSON}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs border ${theme.buttonSecondary}`}
                title="Export configuration JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <label className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs border cursor-pointer ${theme.buttonSecondary}`}>
                <Upload className="w-3.5 h-3.5" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t ${theme.borderMuted}`}>
          <nav className="flex space-x-1 overflow-x-auto py-1.5">
            {[
              { id: 'recipes', label: 'Recipes', icon: Scroll, count: data.recipes.length },
              { id: 'items', label: 'Items & Materials', icon: Box, count: data.items.length },
              { id: 'conditions', label: 'Crafting Conditions', icon: Anvil, count: data.conditions.length },
              { id: 'graphtree', label: 'Tech Tree Graph', icon: Network },
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'simulator', label: 'Simulator', icon: Play },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                    isActive ? theme.buttonActive : theme.buttonInactive
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded border border-current opacity-80">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'recipes' && (
          <RecipeBuilder
            items={data.items}
            conditions={data.conditions}
            recipes={data.recipes}
            setRecipes={setRecipes}
          />
        )}

        {activeTab === 'items' && (
          <ItemManager
            items={data.items}
            setItems={setItems}
            recipes={data.recipes}
          />
        )}

        {activeTab === 'conditions' && (
          <ConditionManager
            conditions={data.conditions}
            setConditions={setConditions}
            recipes={data.recipes}
          />
        )}

        {activeTab === 'graphtree' && (
          <TechTreeGraph
            items={data.items}
            conditions={data.conditions}
            recipes={data.recipes}
          />
        )}

        {activeTab === 'calculator' && (
          <CraftingCalculator
            items={data.items}
            conditions={data.conditions}
            recipes={data.recipes}
          />
        )}

        {activeTab === 'simulator' && (
          <CraftingSimulator
            items={data.items}
            conditions={data.conditions}
            recipes={data.recipes}
          />
        )}
      </main>

      {/* Custom Preset Save Modal */}
      {isCustomPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`${theme.cardBg} border rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4 font-mono`}>
            <h2 className={`text-base font-bold flex items-center gap-2 uppercase tracking-wide ${theme.accentText}`}>
              <Save className="w-4 h-4" /> Save Custom Preset
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              Save your current items, conditions, and recipes as a custom preset for quick loading later.
            </p>

            <form onSubmit={handleSaveCustomPreset} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>
                  Preset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Upgrades v1"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomPresetModalOpen(false)}
                  className={`px-3 py-1.5 rounded text-xs border ${theme.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded text-xs ${theme.buttonPrimary}`}
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-3 text-center text-xs font-mono transition-colors ${theme.panelBg} ${theme.borderMuted} ${theme.textMuted}`}>
        /// CRAFT_DESIGNER_SUITE • TAC_CONFIG_PANEL • ALL_THEMES_ACTIVE
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
