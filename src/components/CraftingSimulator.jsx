import React, { useState } from 'react';
import {
  Play, CheckCircle2, XCircle, Plus, Minus, RotateCcw, Sparkles, Box, Hammer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';
import { useTheme } from '../utils/theme';

export function CraftingSimulator({ items, conditions, recipes }) {
  const { theme } = useTheme();

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

  const getRequiredFuels = (recipe) => {
    const fuels = {};
    if (recipe.fuelItemId && recipe.fuelQuantity > 0) {
      fuels[recipe.fuelItemId] = (fuels[recipe.fuelItemId] || 0) + recipe.fuelQuantity;
    }
    (recipe.conditionIds || []).forEach(condId => {
      const cond = getConditionById(condId);
      if (cond && cond.fuelItemId && cond.fuelQuantity > 0) {
        fuels[cond.fuelItemId] = (fuels[cond.fuelItemId] || 0) + cond.fuelQuantity;
      }
    });
    return fuels;
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

    const missingFuels = [];
    const requiredFuels = getRequiredFuels(recipe);
    Object.entries(requiredFuels).forEach(([fuelItemId, reqQty]) => {
      const available = inventory[fuelItemId] || 0;
      if (available < reqQty) {
        const fuelItem = getItemById(fuelItemId);
        missingFuels.push(`${reqQty - available}x ${fuelItem ? fuelItem.name : fuelItemId}`);
      }
    });

    return {
      canCraft: missingInputs.length === 0 && missingConditions.length === 0 && missingFuels.length === 0,
      missingInputs,
      missingConditions,
      missingFuels,
      requiredFuels
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
      if (status.missingFuels.length > 0) {
        errMsg += ` Missing fuel: ${status.missingFuels.join(', ')}.`;
      }
      setLastCraftMessage({ type: 'error', text: errMsg });
      return;
    }

    // Deduct inputs
    const nextInv = { ...inventory };
    recipe.inputs.forEach(inp => {
      nextInv[inp.itemId] = (nextInv[inp.itemId] || 0) - inp.quantity;
    });

    // Deduct fuels
    Object.entries(status.requiredFuels).forEach(([fuelItemId, qty]) => {
      if (nextInv[fuelItemId] !== undefined) {
        nextInv[fuelItemId] = Math.max(0, (nextInv[fuelItemId] || 0) - qty);
      }
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
    <div className="space-y-5 font-mono">
      {/* Top Banner & Control */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${theme.cardBg} ${theme.border}`}>
        <div>
          <h2 className={`text-base font-bold uppercase tracking-wide flex items-center gap-2 ${theme.textBright}`}>
            <Play className={`w-5 h-5 ${theme.accentText}`} />
            Interactive Crafting Simulator
          </h2>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            Set player inventory and unlocked conditions to simulate real-time crafting!
          </p>
        </div>

        <button
          onClick={resetAll}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${theme.buttonSecondary}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Inventory & Status
        </button>
      </div>

      {/* Crafting Result Alert Message */}
      {lastCraftMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          lastCraftMessage.type === 'success'
            ? `${theme.badgePrimary}`
            : 'bg-rose-950/60 border-rose-700 text-rose-200'
        }`}>
          {lastCraftMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="text-xs font-bold uppercase tracking-wide">{lastCraftMessage.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Inventory & Unlocked Conditions Checklists */}
        <div className="space-y-5">
          {/* Unlocked Conditions Checklist */}
          <div className={`p-5 rounded-xl border space-y-3 ${theme.cardBg} ${theme.border}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.accentText}`}>
              <Hammer className="w-4 h-4" />
              Unlocked Conditions & Facilities
            </h3>

            {conditions.length === 0 ? (
              <p className={`text-xs italic ${theme.textMuted}`}>No conditions created.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {conditions.map(cond => {
                  const isUnlocked = unlockedConditions.has(cond.id);
                  const CondIcon = getConditionIconComponent(cond.icon);
                  return (
                    <div
                      key={cond.id}
                      onClick={() => toggleCondition(cond.id)}
                      className={`flex items-center justify-between p-2.5 rounded border cursor-pointer select-none transition-all ${
                        isUnlocked
                          ? theme.buttonActive
                          : theme.buttonSecondary
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CondIcon className="w-4 h-4" />
                        <div>
                          <p className="text-xs font-bold">{cond.name}</p>
                          <p className="text-[10px] opacity-75 capitalize">{cond.type} • {cond.level}</p>
                        </div>
                      </div>

                      <div className="w-4 h-4 rounded border border-current flex items-center justify-center">
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Player Inventory */}
          <div className={`p-5 rounded-xl border space-y-3 ${theme.cardBg} ${theme.border}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.accentText}`}>
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
                    className={`flex items-center justify-between p-2 rounded border ${theme.panelBg} ${theme.border}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ItemIcon className={`w-4 h-4 shrink-0 ${theme.accentText}`} />
                      <span className={`text-xs font-bold truncate ${theme.textBright}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateInventory(item.id, -1)}
                        className={`w-6 h-6 flex items-center justify-center rounded border text-xs ${theme.buttonSecondary}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`w-8 text-center text-xs font-bold ${theme.textBright}`}>{qty}</span>
                      <button
                        onClick={() => handleUpdateInventory(item.id, 1)}
                        className={`w-6 h-6 flex items-center justify-center rounded border text-xs ${theme.buttonSecondary}`}
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
        <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${theme.cardBg} ${theme.border}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
            Available Recipes
          </h3>

          {recipes.length === 0 ? (
            <p className={`text-xs italic p-6 text-center ${theme.textMuted}`}>No recipes created to craft!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map(recipe => {
                const outputItem = getItemById(recipe.outputItemId);
                const OutputIcon = outputItem ? getItemIconComponent(outputItem.icon) : Box;
                const status = canCraftRecipe(recipe);

                return (
                  <div
                    key={recipe.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${theme.panelBg} ${theme.border}`}
                  >
                    <div>
                      {/* Title & Output */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded border ${theme.border} ${theme.cardBg}`}>
                            <OutputIcon className={`w-5 h-5 ${theme.accentText}`} />
                          </div>
                          <div>
                            <h4 className={`font-bold text-xs uppercase ${theme.textBright}`}>{recipe.name}</h4>
                            <p className={`text-[10px] font-bold ${theme.accentText}`}>
                              Yields {recipe.outputQuantity}x {outputItem ? outputItem.name : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inputs status */}
                      <div className="space-y-1 mt-3">
                        <p className={`text-[10px] font-bold uppercase ${theme.textMuted}`}>Required Ingredients:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.inputs.map((inp, idx) => {
                            const available = inventory[inp.itemId] || 0;
                            const hasEnough = available >= inp.quantity;
                            const inpItem = getItemById(inp.itemId);
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                                  hasEnough
                                    ? theme.badgeSecondary
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
                          <p className={`text-[10px] font-bold uppercase ${theme.textMuted}`}>Required Conditions:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.conditionIds.map(condId => {
                              const isUnlocked = unlockedConditions.has(condId);
                              const cond = getConditionById(condId);
                              return (
                                <span
                                  key={condId}
                                  className={`text-[10px] px-2 py-0.5 rounded border ${
                                    isUnlocked
                                      ? theme.badgePrimary
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

                      {/* Fuel status */}
                      {Object.keys(status.requiredFuels).length > 0 && (
                        <div className="space-y-1 mt-2">
                          <p className={`text-[10px] font-bold uppercase ${theme.textMuted}`}>Required Fuel:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(status.requiredFuels).map(([fuelItemId, reqQty]) => {
                              const available = inventory[fuelItemId] || 0;
                              const hasEnough = available >= reqQty;
                              const fuelItem = getItemById(fuelItemId);
                              return (
                                <span
                                  key={fuelItemId}
                                  className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                                    hasEnough
                                      ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                                  }`}
                                >
                                  Fuel ({fuelItem ? fuelItem.name : fuelItemId}): {available}/{reqQty}
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
                      className={`w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        status.canCraft
                          ? theme.buttonPrimary
                          : 'opacity-50 cursor-not-allowed border'
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
