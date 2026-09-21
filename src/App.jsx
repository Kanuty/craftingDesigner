import React, { useState, useEffect } from 'react';
import {
  Box, Anvil, Scroll, Calculator, Play, Download, Upload, RotateCcw, Sparkles, Gamepad2, Network,
  Save, Trash2, Sun, Moon, Palette
} from 'lucide-react';
import {
  loadDataFromStorage,
  saveDataToStorage,
  PRESETS,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset
} from './utils/storage';
import { ItemManager } from './components/ItemManager';
import { ConditionManager } from './components/ConditionManager';
import { RecipeBuilder } from './components/RecipeBuilder';
import { CraftingCalculator } from './components/CraftingCalculator';
import { CraftingSimulator } from './components/CraftingSimulator';
import TechTreeGraph from './components/TechTreeGraph';

export default function App() {
  const [data, setData] = useState(() => loadDataFromStorage());
  const [customPresets, setCustomPresets] = useState(() => loadCustomPresets());
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes', 'items', 'conditions', 'graphtree', 'calculator', 'simulator'
  const [theme, setTheme] = useState('blueprint'); // 'blueprint' (default light mode) or 'cyber' (dark neon blue/black mode)
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

  const handleDeleteCustomPreset = (presetId, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete custom preset "${name}"?`)) {
      const updated = deleteCustomPreset(presetId);
      setCustomPresets(updated);
    }
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

  // Theme style classes
  const isBlueprint = theme === 'blueprint';

  const themeClasses = {
    bg: isBlueprint ? 'bg-sky-50 text-slate-800' : 'bg-black text-cyan-100',
    headerBg: isBlueprint ? 'bg-sky-900 border-sky-800 text-white shadow-md' : 'bg-slate-950 border-cyan-500/30 text-cyan-300 shadow-cyan-900/20 shadow-lg',
    accentText: isBlueprint ? 'text-sky-900' : 'text-cyan-400',
    cardBg: isBlueprint ? 'bg-white border-sky-200 shadow-sm' : 'bg-slate-900/90 border-cyan-500/30 shadow-cyan-950/40',
    buttonActive: isBlueprint ? 'bg-sky-700 text-white shadow border border-sky-600' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/20',
    buttonInactive: isBlueprint ? 'text-sky-200 hover:text-white hover:bg-sky-800/80' : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900',
    subHeader: isBlueprint ? 'text-sky-200' : 'text-cyan-400/80',
    border: isBlueprint ? 'border-sky-200' : 'border-cyan-900/50'
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Top Header Navigation */}
      <header className={`sticky top-0 z-40 border-b transition-colors ${themeClasses.headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg ${isBlueprint ? 'bg-sky-800 text-sky-100 border border-sky-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-cyan-500/20'}`}>
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold my-0 tracking-tight flex items-center gap-2">
                Game Crafting & Recipe Designer
              </h1>
              <p className={`text-[11px] ${themeClasses.subHeader}`}>Design complex items, conditions, and crafting tech trees</p>
            </div>
          </div>

          {/* Theme Switcher, Presets & Utilities */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Toggle Button */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${isBlueprint ? 'bg-sky-950/40 border-sky-700' : 'bg-slate-900 border-cyan-900'}`}>
              <button
                onClick={() => setTheme('blueprint')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isBlueprint ? 'bg-sky-100 text-sky-900 shadow font-bold' : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Blueprint Architectural Style"
              >
                <Sun className="w-3.5 h-3.5" />
                Blueprint
              </button>
              <button
                onClick={() => setTheme('cyber')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isBlueprint ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 font-bold' : 'text-sky-200 hover:text-white'
                }`}
                title="Cyber Ops Neon Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                Cyber Ops
              </button>
            </div>

            {/* Presets */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${isBlueprint ? 'bg-sky-950/40 border-sky-700' : 'bg-slate-900 border-cyan-900'}`}>
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider px-1">Presets:</span>
              <button
                onClick={() => handleLoadPreset(PRESETS.rpg, 'RPG Crafting')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  isBlueprint ? 'bg-sky-800 hover:bg-sky-700 text-white border-sky-600' : 'bg-slate-800 hover:bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}
              >
                RPG
              </button>
              <button
                onClick={() => handleLoadPreset(PRESETS.crafter, 'Crafter Automation')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  isBlueprint ? 'bg-sky-800 hover:bg-sky-700 text-white border-sky-600' : 'bg-slate-800 hover:bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}
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
                  className={`px-2 py-1 text-xs font-medium rounded-lg border focus:outline-none ${
                    isBlueprint ? 'bg-sky-800 text-white border-sky-600' : 'bg-slate-800 text-cyan-300 border-cyan-800'
                  }`}
                  defaultValue=""
                >
                  <option value="" disabled>Custom Presets...</option>
                  {Object.values(customPresets).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setIsCustomPresetModalOpen(true)}
                className="px-2 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Save current state as custom preset"
              >
                <Save className="w-3 h-3" />
                Save Preset
              </button>

              <button
                onClick={handleResetToDefault}
                className="px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                title="Reset to default RPG state"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Export / Import */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportJSON}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isBlueprint ? 'bg-sky-800 hover:bg-sky-700 text-white border-sky-600' : 'bg-slate-900 hover:bg-slate-800 text-cyan-200 border-cyan-800'
                }`}
                title="Export configuration JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <label className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isBlueprint ? 'bg-sky-800 hover:bg-sky-700 text-white border-sky-600' : 'bg-slate-900 hover:bg-slate-800 text-cyan-200 border-cyan-800'
              }`}>
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
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t ${isBlueprint ? 'border-sky-800/60' : 'border-cyan-900/50'}`}>
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {[
              { id: 'recipes', label: 'Recipes', icon: Scroll, count: data.recipes.length },
              { id: 'items', label: 'Items & Materials', icon: Box, count: data.items.length },
              { id: 'conditions', label: 'Crafting Conditions', icon: Anvil, count: data.conditions.length },
              { id: 'graphtree', label: 'Visual Node Graph', icon: Network },
              { id: 'calculator', label: 'Crafting Tree & Calculator', icon: Calculator },
              { id: 'simulator', label: 'Interactive Simulator', icon: Play },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive ? themeClasses.buttonActive : themeClasses.buttonInactive
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isBlueprint ? 'bg-sky-950 text-sky-200' : 'bg-slate-950 text-cyan-400 border border-cyan-900'
                    }`}>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100">
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
              <Save className="w-5 h-5" /> Save Custom Preset
            </h2>
            <p className="text-xs text-slate-400">
              Save your current items, conditions, and recipes as a custom preset for quick loading later.
            </p>

            <form onSubmit={handleSaveCustomPreset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Custom Sci-Fi Crafting"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomPresetModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs transition-colors ${
        isBlueprint ? 'bg-sky-900/30 border-sky-200 text-sky-800' : 'bg-slate-950 border-cyan-900/40 text-cyan-600'
      }`}>
        Game Crafting & Recipe Designer • RPG, Crafter Automation, and Custom Recipe Assistant
      </footer>
    </div>
  );
}
