import React, { useState } from 'react';
import {
  Play, CheckCircle2, XCircle, AlertCircle, Plus, Minus, RotateCcw, Sparkles, Box, Hammer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';

export function CraftingSimulator({ items, conditions, recipes }) {
  // Inventory state: map of itemId -> quantity
  const [inventory, setInventory] = useState(() => {
    const initial = {};
    items.forEach(item => {
      // Give initial base quantity for raw materials so user can test simulator immediately
      initial[item.id] = item.category === 'Raw' ? 10 : 0;
    });
    return initial;
  });

  // Active conditions state: set of unlocked conditionIds
  const [unlockedConditions, setUnlockedConditions] = useState(() => {
    const initial = new Set();
    // unlock first condition by default
    if (conditions.length > 0) initial.add(conditions[0].id);
    return initial;
  });

  const [lastCraftMessage, setLastCraftMessage] = useState(null);

  const getItemById = (id) => items.find(i => i.id === id);
  const getConditionById = (id) => conditions.find(c => c.id === id);

  const handleUpdateInventory = (itemId, delta) => {
    setInventory(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
    }));
  };

  const toggleCondition = (condId) => {
    setUnlockedConditions(prev => {
      const next = new Set(prev);
      if (next.has(condId)) next.delete(condId);
      else next.add(condId);
      return next;
    });
  };

  const resetAll = () => {
    const resetInv = {};
    items.forEach(i => { resetInv[i.id] = i.category === 'Raw' ? 10 : 0; });
    setInventory(resetInv);
    setUnlockedConditions(new Set(conditions.length > 0 ? [conditions[0].id] : []));
    setLastCraftMessage(null);
  };

  const canCraftRecipe = (recipe) => {
    const missingInputs = [];
    recipe.inputs.forEach(input => {
      const available = inventory[input.itemId] || 0;
      if (available < input.quantity) {
        const item = getItemById(input.itemId);
        missingInputs.push(`${input.quantity - available}x ${item ? item.name : input.itemId}`);
      }
    });

    const missingConditions = [];
    (recipe.conditionIds || []).forEach(condId => {
      if (!unlockedConditions.has(condId)) {
        const cond = getConditionById(condId);
        missingConditions.push(cond ? cond.name : condId);
      }
    });

    return {
      canCraft: missingInputs.length === 0 && missingConditions.length === 0,
      missingInputs,
      missingConditions
    };
  };

  const executeCraft = (recipe) => {
    const status = canCraftRecipe(recipe);
    if (!status.canCraft) {
      let errMsg = 'Cannot craft recipe!';
      if (status.missingInputs.length > 0) {
        errMsg += ` Missing inputs: ${status.missingInputs.join(', ')}.`;
      }
      if (status.missingConditions.length > 0) {
        errMsg += ` Missing conditions: ${status.missingConditions.join(', ')}.`;
      }
      setLastCraftMessage({ type: 'error', text: errMsg });
      return;
    }

    // Deduct inputs
    const nextInv = { ...inventory };
    recipe.inputs.forEach(inp => {
      nextInv[inp.itemId] = (nextInv[inp.itemId] || 0) - inp.quantity;
    });

    // Add output
    nextInv[recipe.outputItemId] = (nextInv[recipe.outputItemId] || 0) + (recipe.outputQuantity || 1);

    setInventory(nextInv);
    const outputItem = getItemById(recipe.outputItemId);
    const successText = `Successfully crafted ${recipe.outputQuantity || 1}x ${outputItem ? outputItem.name : 'Item'}!`;
    setLastCraftMessage({ type: 'success', text: successText });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            Interactive Crafting Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set your player inventory and unlocked workstation/skill conditions to simulate real-time crafting!
          </p>
        </div>

        <button
          onClick={resetAll}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Inventory & Status
        </button>
      </div>

      {/* Crafting Result Alert Message */}
      {lastCraftMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-200 ${
          lastCraftMessage.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
            : 'bg-rose-950/60 border-rose-700 text-rose-200'
        }`}>
          {lastCraftMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="text-sm font-medium">{lastCraftMessage.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inventory & Unlocked Conditions Checklists */}
        <div className="space-y-6">
          {/* Unlocked Conditions Checklist */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Hammer className="w-4 h-4" />
              Unlocked Conditions & Facilities
            </h3>

            {conditions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No conditions created.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {conditions.map(cond => {
                  const isUnlocked = unlockedConditions.has(cond.id);
                  const CondIcon = getConditionIconComponent(cond.icon);
                  return (
                    <div
                      key={cond.id}
                      onClick={() => toggleCondition(cond.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isUnlocked
                          ? 'bg-purple-950/40 border-purple-600/80 text-purple-100'
                          : 'bg-slate-900 border-slate-800 text-slate-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CondIcon className={`w-4 h-4 ${isUnlocked ? 'text-purple-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-xs font-semibold">{cond.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{cond.type} • {cond.level}</p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isUnlocked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700'
                      }`}>
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Player Inventory */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Box className="w-4 h-4" />
              Player Inventory
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {items.map(item => {
                const qty = inventory[item.id] || 0;
                const ItemIcon = getItemIconComponent(item.icon);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-slate-900/80 rounded-lg border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ItemIcon className={`w-4 h-4 shrink-0 ${qty > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
                      <span className={`text-xs font-medium truncate ${qty > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateInventory(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-700 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-100">{qty}</span>
                      <button
                        onClick={() => handleUpdateInventory(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-700 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recipe Crafting Panel */}
        <div className="lg:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Available Recipes
          </h3>

          {recipes.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-6 text-center">No recipes created to craft!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map(recipe => {
                const outputItem = getItemById(recipe.outputItemId);
                const OutputIcon = outputItem ? getItemIconComponent(outputItem.icon) : Box;
                const status = canCraftRecipe(recipe);

                return (
                  <div
                    key={recipe.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      status.canCraft
                        ? 'bg-slate-900 border-emerald-800/80 hover:border-emerald-600 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Title & Output */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${
                            status.canCraft ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                            <OutputIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-100 text-sm">{recipe.name}</h4>
                            <p className="text-[11px] text-emerald-400 font-medium">
                              Yields {recipe.outputQuantity}x {outputItem ? outputItem.name : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inputs status */}
                      <div className="space-y-1 mt-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Ingredients:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.inputs.map((inp, idx) => {
                            const available = inventory[inp.itemId] || 0;
                            const hasEnough = available >= inp.quantity;
                            const inpItem = getItemById(inp.itemId);
                            return (
                              <span
                                key={idx}
                                className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                                  hasEnough
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                                }`}
                              >
                                {inpItem ? inpItem.name : inp.itemId}: {available}/{inp.quantity}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conditions status */}
                      {recipe.conditionIds && recipe.conditionIds.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Conditions:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.conditionIds.map(condId => {
                              const isUnlocked = unlockedConditions.has(condId);
                              const cond = getConditionById(condId);
                              return (
                                <span
                                  key={condId}
                                  className={`text-[10px] px-2 py-0.5 rounded border ${
                                    isUnlocked
                                      ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                                  }`}
                                >
                                  {cond ? cond.name : condId} {isUnlocked ? '✓' : '✗'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => executeCraft(recipe)}
                      disabled={!status.canCraft}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        status.canCraft
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {status.canCraft ? 'Craft Item' : 'Requirements Unmet'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
