import React, { useState, useEffect } from 'react';
import {
  Box, Anvil, Scroll, Calculator, Play, Download, Upload, RotateCcw, Sparkles, Gamepad2, Network
} from 'lucide-react';
import { loadDataFromStorage, saveDataToStorage, PRESETS } from './utils/storage';
import { ItemManager } from './components/ItemManager';
import { ConditionManager } from './components/ConditionManager';
import { RecipeBuilder } from './components/RecipeBuilder';
import { CraftingCalculator } from './components/CraftingCalculator';
import { CraftingSimulator } from './components/CraftingSimulator';
import TechTreeGraph from './components/TechTreeGraph';

export default function App() {
  const [data, setData] = useState(() => loadDataFromStorage());
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes', 'items', 'conditions', 'graphtree', 'calculator', 'simulator'

  // Persist on state changes
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

  const handleLoadPreset = (presetKey) => {
    if (PRESETS[presetKey]) {
      if (window.confirm(`Load "${PRESETS[presetKey].name}" preset? This will overwrite your current items, conditions, and recipes.`)) {
        setData(PRESETS[presetKey]);
      }
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent my-0 tracking-tight">
                Game Crafting & Recipe Designer
              </h1>
              <p className="text-[11px] text-slate-400">Design complex items, conditions, and crafting trees</p>
            </div>
          </div>

          {/* Preset Selector & Utilities */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Presets */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">Presets:</span>
              <button
                onClick={() => handleLoadPreset('witcher')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Witcher 3
              </button>
              <button
                onClick={() => handleLoadPreset('factorio')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-purple-600/30 hover:text-purple-300 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Factorio
              </button>
            </div>

            {/* Export / Import */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                title="Export configuration JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export
              </button>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {[
              { id: 'recipes', label: 'Recipes', icon: Scroll, color: 'text-emerald-400', count: data.recipes.length },
              { id: 'items', label: 'Items & Materials', icon: Box, color: 'text-indigo-400', count: data.items.length },
              { id: 'conditions', label: 'Crafting Conditions', icon: Anvil, color: 'text-purple-400', count: data.conditions.length },
              { id: 'graphtree', label: 'Visual Node Graph', icon: Network, color: 'text-amber-400' },
              { id: 'calculator', label: 'Crafting Tree & Calculator', icon: Calculator, color: 'text-sky-400' },
              { id: 'simulator', label: 'Interactive Simulator', icon: Play, color: 'text-amber-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 bg-slate-900 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-800">
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

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Game Crafting & Recipe Designer • Witcher, Factorio, and RPG Crafting Assistant
      </footer>
    </div>
  );
}
