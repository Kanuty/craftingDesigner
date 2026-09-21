import React, { useState } from 'react';
import {
  Calculator, Layers, Clock, Sparkles, CheckCircle2
} from 'lucide-react';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';
import { useTheme } from '../utils/theme';

export function CraftingCalculator({ items, conditions, recipes }) {
  const { theme } = useTheme();
  const [selectedTargetItem, setSelectedTargetItem] = useState(
    items.find(i => i.category === 'Finished' || i.category === 'Intermediate')?.id || (items[0]?.id || '')
  );
  const [targetQuantity, setTargetQuantity] = useState(1);

  const getItemById = (id) => items.find(i => i.id === id);
  const getConditionById = (id) => conditions.find(c => c.id === id);
  const getRecipeForOutput = (outputItemId) => recipes.find(r => r.outputItemId === outputItemId);

  // Recursive calculation function
  const calculateRequirements = (itemId, desiredQty, visited = new Set()) => {
    const item = getItemById(itemId);
    if (!item) return { rawMaterials: {}, conditionsRequired: new Set(), tree: null, timeTotal: 0 };

    const recipe = getRecipeForOutput(itemId);

    // If no recipe or cyclic dependency or Raw item -> it's a raw material requirement
    if (!recipe || visited.has(itemId) || item.category === 'Raw') {
      return {
        rawMaterials: { [itemId]: desiredQty },
        conditionsRequired: new Set(),
        tree: {
          itemId,
          item,
          quantity: desiredQty,
          isRaw: true,
          children: []
        },
        timeTotal: 0
      };
    }

    // Mark current item to prevent infinite loops
    const nextVisited = new Set(visited);
    nextVisited.add(itemId);

    // Number of recipe runs needed
    const runsNeeded = Math.ceil(desiredQty / (recipe.outputQuantity || 1));
    const totalYield = runsNeeded * (recipe.outputQuantity || 1);
    const craftTime = (recipe.craftTimeSeconds || 0) * runsNeeded;

    let aggregateRaw = {};
    let aggregateConditions = new Set(recipe.conditionIds || []);
    let childNodes = [];
    let childTimeTotal = 0;

    recipe.inputs.forEach(input => {
      const neededQtyForInput = input.quantity * runsNeeded;
      const childResult = calculateRequirements(input.itemId, neededQtyForInput, nextVisited);

      // Merge raw materials
      Object.entries(childResult.rawMaterials).forEach(([rId, qty]) => {
        aggregateRaw[rId] = (aggregateRaw[rId] || 0) + qty;
      });

      // Merge conditions
      childResult.conditionsRequired.forEach(condId => aggregateConditions.add(condId));

      childTimeTotal += childResult.timeTotal;
      childNodes.push({
        ...childResult.tree,
        inputQtyPerBatch: input.quantity
      });
    });

    // Calculate fuel required for this recipe and its workstation conditions
    if (recipe.fuelItemId && recipe.fuelQuantity > 0) {
      const fuelTotal = recipe.fuelQuantity * runsNeeded;
      aggregateRaw[recipe.fuelItemId] = (aggregateRaw[recipe.fuelItemId] || 0) + fuelTotal;
    }
    (recipe.conditionIds || []).forEach(condId => {
      const cond = getConditionById(condId);
      if (cond && cond.fuelItemId && cond.fuelQuantity > 0) {
        const condFuelTotal = cond.fuelQuantity * runsNeeded;
        aggregateRaw[cond.fuelItemId] = (aggregateRaw[cond.fuelItemId] || 0) + condFuelTotal;
      }
    });

    return {
      rawMaterials: aggregateRaw,
      conditionsRequired: aggregateConditions,
      tree: {
        itemId,
        item,
        quantity: desiredQty,
        totalYield,
        recipe,
        runsNeeded,
        isRaw: false,
        children: childNodes
      },
      timeTotal: craftTime + childTimeTotal
    };
  };

  const calculation = selectedTargetItem
    ? calculateRequirements(selectedTargetItem, Math.max(1, targetQuantity))
    : null;

  // Render tree recursive component
  const renderTreeNode = (node, depth = 0) => {
    if (!node) return null;

    const IconComp = getItemIconComponent(node.item?.icon);

    return (
      <div key={node.itemId + '_' + depth} className="space-y-2">
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
          node.isRaw
            ? `${theme.panelBg} ${theme.border}`
            : `${theme.cardBg} ${theme.border}`
        }`}>
          <div className={`p-2 rounded-lg border ${theme.border} ${theme.panelBg}`}>
            <IconComp className={`w-5 h-5 ${theme.accentText}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm uppercase tracking-wide ${theme.textBright}`}>{node.item?.name || node.itemId}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badgeSecondary}`}>
                {node.isRaw ? 'Base Material' : 'Crafted Item'}
              </span>
            </div>

            <div className={`text-xs mt-0.5 flex flex-wrap items-center gap-x-3 ${theme.textMuted}`}>
              <span>Required: <strong className="text-current font-bold">{node.quantity}x</strong></span>
              {!node.isRaw && node.recipe && (
                <>
                  <span>Batch Runs: {node.runsNeeded} (Yields {node.totalYield})</span>
                  <span>Craft Time: {(node.recipe.craftTimeSeconds || 0) * node.runsNeeded}s</span>
                </>
              )}
            </div>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <div className={`pl-5 border-l-2 space-y-2 ml-4 ${theme.border}`}>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Target Selector Header */}
      <div className={`p-5 rounded-xl border space-y-4 ${theme.cardBg} ${theme.border}`}>
        <h2 className={`text-base font-bold flex items-center gap-2 uppercase tracking-wide ${theme.textBright}`}>
          <Calculator className={`w-5 h-5 ${theme.accentText}`} />
          Crafting Tree & Material Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Select Target Item to Craft
            </label>
            <select
              value={selectedTargetItem}
              onChange={(e) => setSelectedTargetItem(e.target.value)}
              className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Target Quantity
            </label>
            <input
              type="number"
              min="1"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
              className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
            />
          </div>
        </div>
      </div>

      {calculation && calculation.tree && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Breakdown Visual Tree */}
          <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${theme.cardBg} ${theme.border}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textMuted}`}>
              <Layers className={`w-4 h-4 ${theme.accentText}`} />
              Hierarchical Crafting Tree
            </h3>

            <div className="space-y-3">
              {renderTreeNode(calculation.tree)}
            </div>
          </div>

          {/* Right Column: Aggregated Raw Materials & All Required Conditions */}
          <div className="space-y-5">
            {/* Raw Materials Total */}
            <div className={`p-5 rounded-xl border space-y-3 ${theme.cardBg} ${theme.border}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.accentText}`}>
                <Sparkles className="w-4 h-4" />
                Total Raw Materials Needed
              </h3>

              {Object.keys(calculation.rawMaterials).length === 0 ? (
                <p className={`text-xs italic ${theme.textMuted}`}>No base raw materials required.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(calculation.rawMaterials).map(([rawId, qty]) => {
                    const rawItem = getItemById(rawId);
                    const RawIcon = rawItem ? getItemIconComponent(rawItem.icon) : Layers;
                    return (
                      <div key={rawId} className={`flex items-center justify-between p-2.5 rounded border ${theme.panelBg} ${theme.border}`}>
                        <div className="flex items-center gap-2.5">
                          <RawIcon className={`w-4 h-4 ${theme.accentText}`} />
                          <span className={`text-xs font-bold ${theme.textBright}`}>
                            {rawItem ? rawItem.name : rawId}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${theme.badgePrimary}`}>
                          {qty}x
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {calculation.timeTotal > 0 && (
                <div className={`pt-3 border-t flex items-center justify-between text-xs ${theme.borderMuted} ${theme.textMuted}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Total Craft Time:
                  </span>
                  <span className={`font-bold ${theme.textBright}`}>{calculation.timeTotal.toFixed(1)}s</span>
                </div>
              )}
            </div>

            {/* Total Required Conditions */}
            <div className={`p-5 rounded-xl border space-y-3 ${theme.cardBg} ${theme.border}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.accentText}`}>
                <CheckCircle2 className="w-4 h-4" />
                All Required Conditions
              </h3>

              {calculation.conditionsRequired.size === 0 ? (
                <p className={`text-xs italic ${theme.textMuted}`}>No workstation or skill conditions required!</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(calculation.conditionsRequired).map(condId => {
                    const cond = getConditionById(condId);
                    if (!cond) return null;
                    const CondIcon = getConditionIconComponent(cond.icon);
                    return (
                      <div key={condId} className={`flex items-center justify-between p-2.5 border rounded ${theme.panelBg} ${theme.border}`}>
                        <div className="flex items-center gap-2.5">
                          <CondIcon className={`w-4 h-4 ${theme.accentText}`} />
                          <div>
                            <p className={`text-xs font-bold ${theme.textBright}`}>{cond.name}</p>
                            <p className={`text-[10px] capitalize ${theme.textMuted}`}>{cond.type} • {cond.level}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
