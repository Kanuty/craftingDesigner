import React, { useState } from 'react';
import {
  Calculator, ChevronRight, Layers, Clock, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';

export function CraftingCalculator({ items, conditions, recipes }) {
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
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
            : 'bg-slate-800/80 border-slate-700 text-slate-100'
        }`}>
          <div className={`p-2 rounded-lg border ${
            node.isRaw
              ? 'bg-amber-900/40 border-amber-700/60 text-amber-400'
              : 'bg-indigo-900/40 border-indigo-700/60 text-indigo-400'
          }`}>
            <IconComp className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{node.item?.name || node.itemId}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                node.isRaw ? 'bg-amber-950 text-amber-400 border border-amber-800/60' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
              }`}>
                {node.isRaw ? 'Base Material' : 'Crafted Item'}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3">
              <span>Required: <strong className="text-slate-200">{node.quantity}x</strong></span>
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
          <div className="pl-6 border-l-2 border-slate-700/80 space-y-2 ml-4">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Selector Header */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          Crafting Tree & Material Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Target Item to Craft
            </label>
            <select
              value={selectedTargetItem}
              onChange={(e) => setSelectedTargetItem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Quantity
            </label>
            <input
              type="number"
              min="1"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {calculation && calculation.tree && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Breakdown Visual Tree */}
          <div className="lg:col-span-2 bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Hierarchical Crafting Tree
            </h3>

            <div className="space-y-3">
              {renderTreeNode(calculation.tree)}
            </div>
          </div>

          {/* Right Column: Aggregated Raw Materials & All Required Conditions */}
          <div className="space-y-6">
            {/* Raw Materials Total */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Total Raw Materials Needed
              </h3>

              {Object.keys(calculation.rawMaterials).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No base raw materials required.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(calculation.rawMaterials).map(([rawId, qty]) => {
                    const rawItem = getItemById(rawId);
                    const RawIcon = rawItem ? getItemIconComponent(rawItem.icon) : Layers;
                    return (
                      <div key={rawId} className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                          <RawIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium text-slate-200">
                            {rawItem ? rawItem.name : rawId}
                          </span>
                        </div>
                        <span className="text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-md">
                          {qty}x
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {calculation.timeTotal > 0 && (
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Total Craft Time:
                  </span>
                  <span className="font-semibold text-slate-200">{calculation.timeTotal.toFixed(1)}s</span>
                </div>
              )}
            </div>

            {/* Total Required Conditions */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                All Required Conditions
              </h3>

              {calculation.conditionsRequired.size === 0 ? (
                <p className="text-xs text-slate-400 italic">No workstation or skill conditions required!</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(calculation.conditionsRequired).map(condId => {
                    const cond = getConditionById(condId);
                    if (!cond) return null;
                    const CondIcon = getConditionIconComponent(cond.icon);
                    return (
                      <div key={condId} className="flex items-center justify-between p-2.5 bg-purple-950/30 border border-purple-800/50 rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <CondIcon className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-xs font-semibold text-purple-200">{cond.name}</p>
                            <p className="text-[10px] text-purple-400 capitalize">{cond.type} • {cond.level}</p>
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
