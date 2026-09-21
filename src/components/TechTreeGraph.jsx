import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Hammer,
  Layers,
  Box,
  Wrench,
  Leaf,
  Skull,
  Wine,
  Gem,
  Mountain,
  Shield,
  Bone,
  FlaskConical,
  Sword,
  Flame,
  Cog,
  Cpu,
  FlaskRound,
  Anvil,
  GraduationCap,
  Award,
  Package,
  Filter,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../utils/theme';

const ICON_MAP = {
  Leaf,
  Skull,
  Wine,
  Gem,
  Mountain,
  Box,
  Shield,
  Bone,
  FlaskConical,
  Sword,
  Flame,
  Cog,
  Cpu,
  FlaskRound,
  Anvil,
  GraduationCap,
  Award,
};

function renderItemIcon(iconName, defaultClass = "w-4 h-4") {
  if (!iconName) return <Package className={defaultClass} />;
  const IconComponent = ICON_MAP[iconName];
  if (IconComponent) {
    return <IconComponent className={defaultClass} />;
  }
  if (typeof iconName === 'string' && iconName.length <= 2) {
    return <span className="text-xl select-none">{iconName}</span>;
  }
  return <Package className={defaultClass} />;
}

// Custom Node for Items
const CustomItemNode = ({ data, selected }) => {
  const { item, recipesUsing, recipesProducing } = data;

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border font-mono transition-all shadow-lg min-w-[170px] max-w-[210px] ${
        selected
          ? 'ring-2 ring-current font-bold'
          : ''
      }`}
      style={{
        backgroundColor: data.nodeBg || '#0d1d2d',
        borderColor: data.nodeBorder || '#00f0ff',
        color: data.nodeText || '#c5f6ff'
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: data.nodeBorder || '#00f0ff' }}
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded border border-current opacity-80">
          {renderItemIcon(item?.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs truncate uppercase tracking-wide">{item?.name}</div>
          <span className="text-[9px] px-1.5 py-0.2 rounded border border-current opacity-80 uppercase">
            {item?.category || 'Item'}
          </span>
        </div>
      </div>

      {item?.description && (
        <p className="text-[10px] opacity-75 line-clamp-2 mt-1 border-t border-current/20 pt-1 italic">
          {item.description}
        </p>
      )}

      <div className="flex justify-between items-center text-[9px] opacity-70 mt-1.5 pt-1 border-t border-current/20">
        <span>In: {recipesProducing?.length || 0}</span>
        <span>Out: {recipesUsing?.length || 0}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: data.nodeBorder || '#00f0ff' }}
      />
    </div>
  );
};

// Custom Node for Recipes/Crafting Operations
const CustomRecipeNode = ({ data, selected }) => {
  const { recipe, conditions } = data;

  return (
    <div
      className={`px-3 py-2 rounded-lg border font-mono transition-all shadow-md min-w-[150px] max-w-[200px] ${
        selected
          ? 'ring-2 ring-current font-bold'
          : ''
      }`}
      style={{
        backgroundColor: data.panelBg || '#031d28',
        borderColor: data.accentColor || '#f59e0b',
        color: data.nodeText || '#c5f6ff'
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="ingredients"
        className="!w-2.5 !h-2.5 !border"
        style={{ backgroundColor: data.accentColor || '#f59e0b' }}
      />

      <div className="flex items-center gap-1.5">
        <Hammer className="w-3.5 h-3.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs truncate uppercase">{recipe?.name}</div>
          <div className="text-[9px] opacity-80">Yield: x{recipe?.outputQuantity || 1}</div>
        </div>
      </div>

      {/* Required Conditions / Workstations */}
      {conditions && conditions.length > 0 && (
        <div className="mt-1.5 pt-1 border-t border-current/20 flex flex-wrap gap-1">
          {conditions.map((cond) => (
            <span
              key={cond.id}
              className="text-[8px] px-1 py-0.2 rounded border border-current/40 uppercase flex items-center gap-0.5"
            >
              <Wrench className="w-2 h-2" />
              {cond.name}
            </span>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-2.5 !h-2.5 !border"
        style={{ backgroundColor: data.accentColor || '#f59e0b' }}
      />
    </div>
  );
};

const nodeTypes = {
  itemNode: CustomItemNode,
  recipeNode: CustomRecipeNode,
};

export default function TechTreeGraph({ items = [], recipes = [], conditions = [] }) {
  const { theme } = useTheme();
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterConditionId, setFilterConditionId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);

  // Helper to extract inputs array
  const getRecipeInputs = (recipe) => recipe.inputs || recipe.ingredients || [];

  // Generate Graph Nodes & Edges automatically
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!items.length) return { nodes: [], edges: [] };

    const itemMap = new Map(items.map((i) => [i.id, i]));
    const conditionMap = new Map(conditions.map((c) => [c.id, c]));

    const eligibleRecipes = recipes.filter((recipe) => {
      if (filterConditionId === 'all') return true;
      return (recipe.conditionIds || []).includes(filterConditionId);
    });

    const itemDepths = new Map();
    const recipeDepths = new Map();

    items.forEach((item) => {
      if ((item.category || '').toLowerCase() === 'raw') {
        itemDepths.set(item.id, 0);
      }
    });

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 20) {
      changed = false;
      iterations++;

      eligibleRecipes.forEach((recipe) => {
        const recipeInputs = getRecipeInputs(recipe);
        const inputDepths = recipeInputs.map((ing) => itemDepths.get(ing.itemId || ing.id));
        if (inputDepths.every((d) => d !== undefined)) {
          const maxInputDepth = inputDepths.length > 0 ? Math.max(...inputDepths) : 0;
          const currentRecipeDepth = recipeDepths.get(recipe.id);
          if (currentRecipeDepth === undefined || currentRecipeDepth < maxInputDepth + 1) {
            recipeDepths.set(recipe.id, maxInputDepth + 1);
            changed = true;

            if (recipe.outputItemId) {
              const currentItemDepth = itemDepths.get(recipe.outputItemId);
              if (currentItemDepth === undefined || currentItemDepth < maxInputDepth + 2) {
                itemDepths.set(recipe.outputItemId, maxInputDepth + 2);
              }
            }
          }
        }
      });
    }

    items.forEach((item) => {
      if (itemDepths.get(item.id) === undefined) {
        const cat = (item.category || '').toLowerCase();
        itemDepths.set(item.id, cat === 'finished' ? 4 : cat === 'intermediate' ? 2 : 0);
      }
    });

    const layerXSpacing = 300;
    const layerYSpacing = 120;
    const layerCounters = new Map();

    const getNextPos = (depth) => {
      const currentCount = layerCounters.get(depth) || 0;
      layerCounters.set(depth, currentCount + 1);
      return {
        x: depth * layerXSpacing + 40,
        y: currentCount * layerYSpacing + 40,
      };
    };

    const graphNodes = [];
    const graphEdges = [];

    const filteredItems = items.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const matchesCategory = filterCategory === 'all' || cat === filterCategory.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const filteredItemIds = new Set(filteredItems.map((i) => i.id));

    filteredItems.forEach((item) => {
      const depth = itemDepths.get(item.id) || 0;
      const pos = getNextPos(depth);

      const recipesUsing = eligibleRecipes.filter((r) =>
        getRecipeInputs(r).some((ing) => (ing.itemId || ing.id) === item.id)
      );
      const recipesProducing = eligibleRecipes.filter((r) => r.outputItemId === item.id);

      graphNodes.push({
        id: `item-${item.id}`,
        type: 'itemNode',
        position: pos,
        data: {
          item,
          recipesUsing,
          recipesProducing,
          nodeBg: theme.nodeBg,
          nodeBorder: theme.nodeBorder,
          nodeText: theme.nodeText,
        },
      });
    });

    eligibleRecipes.forEach((recipe) => {
      const outputItem = itemMap.get(recipe.outputItemId);
      if (!outputItem || !filteredItemIds.has(outputItem.id)) return;

      const rDepth = recipeDepths.get(recipe.id) || (itemDepths.get(recipe.outputItemId) || 1) - 1;
      const rPos = getNextPos(rDepth);

      const reqConditions = (recipe.conditionIds || [])
        .map((cid) => conditionMap.get(cid))
        .filter(Boolean);

      const recipeNodeId = `recipe-${recipe.id}`;

      graphNodes.push({
        id: recipeNodeId,
        type: 'recipeNode',
        position: rPos,
        data: {
          recipe,
          conditions: reqConditions,
          panelBg: theme.panelBg,
          nodeText: theme.nodeText,
          accentColor: theme.nodeBorder,
        },
      });

      const recipeInputs = getRecipeInputs(recipe);
      recipeInputs.forEach((ing) => {
        const ingId = ing.itemId || ing.id;
        if (filteredItemIds.has(ingId)) {
          graphEdges.push({
            id: `edge-${ingId}-to-${recipe.id}`,
            source: `item-${ingId}`,
            target: recipeNodeId,
            sourceHandle: 'output',
            targetHandle: 'ingredients',
            animated: true,
            label: `x${ing.quantity}`,
            style: { stroke: theme.nodeBorder, strokeWidth: 2 },
            labelStyle: { fill: theme.nodeText, fontSize: 10, fontWeight: 700 },
            labelBgStyle: { fill: theme.nodeBg, rx: 4, ry: 4 },
            markerEnd: { type: MarkerType.ArrowClosed, color: theme.nodeBorder },
          });
        }
      });

      graphEdges.push({
        id: `edge-${recipe.id}-to-${recipe.outputItemId}`,
        source: recipeNodeId,
        target: `item-${recipe.outputItemId}`,
        sourceHandle: 'output',
        targetHandle: 'input',
        animated: true,
        style: { stroke: theme.nodeBorder, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: theme.nodeBorder },
      });
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [items, recipes, conditions, filterCategory, filterConditionId, searchTerm, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <div className={`h-[calc(100vh-140px)] flex flex-col font-mono rounded-2xl border overflow-hidden shadow-2xl relative ${theme.bg} ${theme.border}`}>
      {/* Top Filter Bar */}
      <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 z-10 ${theme.headerBg} ${theme.borderMuted}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded border ${theme.border}`}>
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 uppercase tracking-wide ${theme.textBright}`}>
              Tech Tree & Recipe Graph
            </h2>
            <p className={`text-[10px] ${theme.textMuted}`}>
              Visual node graph showing item dependencies, workstations, and craft pathways
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-2 py-1 rounded text-xs focus:outline-none ${theme.inputBg}`}
          />

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-2 py-1 rounded text-xs focus:outline-none capitalize ${theme.inputBg}`}
          >
            <option value="all">All Categories</option>
            <option value="raw">Raw Materials</option>
            <option value="intermediate">Intermediate</option>
            <option value="finished">Finished</option>
          </select>

          {/* Workstation / Tag Filter */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${theme.border} ${theme.panelBg}`}>
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterConditionId}
              onChange={(e) => setFilterConditionId(e.target.value)}
              className="bg-transparent text-xs focus:outline-none font-bold uppercase"
            >
              <option value="all">All Workstations / Skills</option>
              {conditions.map((cond) => (
                <option key={cond.id} value={cond.id}>
                  {cond.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-2.5 py-1 rounded border text-xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer ${
              showLegend
                ? theme.buttonActive
                : theme.buttonSecondary
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Legend
          </button>
        </div>
      </div>

      {/* React Flow Graph Area */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ animated: true }}
        >
          <Background color={theme.nodeBorder} gap={24} size={1} />
          <Controls className={`!border ${theme.cardBg} ${theme.border}`} />
          <MiniMap
            className={`!border ${theme.cardBg} ${theme.border}`}
            nodeColor={() => theme.nodeBorder}
          />
        </ReactFlow>

        {/* Color Legend Overlay */}
        {showLegend && (
          <div className={`absolute top-4 left-4 border rounded-xl p-3 shadow-xl backdrop-blur-md z-20 text-xs space-y-2 max-w-xs ${theme.cardBg} ${theme.border}`}>
            <div className={`font-bold uppercase tracking-wide border-b pb-1 flex justify-between items-center ${theme.borderMuted} ${theme.textBright}`}>
              <span>Graph Legend</span>
              <button
                onClick={() => setShowLegend(false)}
                className="opacity-60 hover:opacity-100 text-[10px]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded border border-current inline-block bg-current/20"></span>
                <span>Node: Item Material / Product</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded border border-current inline-block bg-current/40"></span>
                <span>Node: Recipe Craft Operation</span>
              </div>
            </div>
            <div className={`text-[10px] border-t pt-1.5 ${theme.borderMuted} ${theme.textMuted}`}>
              • Connected arrows represent component ingredient flow.
            </div>
          </div>
        )}

        {/* Selected Node Details Side Panel */}
        {selectedNodeData && (
          <div className={`absolute top-4 right-4 w-80 border rounded-xl p-4 shadow-2xl backdrop-blur-md z-20 font-mono ${theme.cardBg} ${theme.border}`}>
            <div className={`flex justify-between items-start mb-3 border-b pb-2 ${theme.borderMuted}`}>
              <h3 className={`font-bold flex items-center gap-2 text-sm uppercase tracking-wide ${theme.textBright}`}>
                {selectedNodeData.item ? (
                  <>
                    <span className="p-1 rounded border border-current inline-flex items-center">
                      {renderItemIcon(selectedNodeData.item.icon)}
                    </span>
                    {selectedNodeData.item.name}
                  </>
                ) : (
                  <>
                    <Hammer className="w-4 h-4" />
                    {selectedNodeData.recipe?.name}
                  </>
                )}
              </h3>
              <button
                onClick={() => setSelectedNodeData(null)}
                className={`text-xs px-2 py-1 rounded border ${theme.buttonSecondary}`}
              >
                ✕ Close
              </button>
            </div>

            {selectedNodeData.item && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className={theme.textMuted}>Category: </span>
                  <span className={`font-bold uppercase ${theme.accentText}`}>
                    {selectedNodeData.item.category}
                  </span>
                </div>
                {selectedNodeData.item.description && (
                  <p className="italic opacity-80">{selectedNodeData.item.description}</p>
                )}

                {/* Produced by */}
                <div>
                  <h4 className={`font-bold uppercase mb-1 border-b pb-1 ${theme.borderMuted} ${theme.textBright}`}>
                    Produced By ({selectedNodeData.recipesProducing?.length || 0} recipes)
                  </h4>
                  {selectedNodeData.recipesProducing?.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNodeData.recipesProducing.map((r) => (
                        <div key={r.id} className={`p-1.5 rounded border text-[11px] ${theme.panelBg} ${theme.border}`}>
                          <div className="font-bold">{r.name}</div>
                          <div className={`text-[10px] ${theme.textMuted}`}>Yield: x{r.outputQuantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${theme.textMuted}`}>Base material (No recipe)</span>
                  )}
                </div>

                {/* Used in */}
                <div>
                  <h4 className={`font-bold uppercase mb-1 border-b pb-1 ${theme.borderMuted} ${theme.textBright}`}>
                    Used In ({selectedNodeData.recipesUsing?.length || 0} recipes)
                  </h4>
                  {selectedNodeData.recipesUsing?.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNodeData.recipesUsing.map((r) => (
                        <div key={r.id} className={`p-1.5 rounded border text-[11px] ${theme.panelBg} ${theme.border}`}>
                          <div className="font-bold">{r.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${theme.textMuted}`}>End product</span>
                  )}
                </div>
              </div>
            )}

            {selectedNodeData.recipe && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className={theme.textMuted}>Crafting Time: </span>
                  <span className="font-bold">
                    {selectedNodeData.recipe.craftTimeSeconds || selectedNodeData.recipe.craftingTime || 0}s
                  </span>
                </div>
                <div>
                  <span className={theme.textMuted}>Yield Output: </span>
                  <span className={`font-bold ${theme.accentText}`}>
                    x{selectedNodeData.recipe.outputQuantity || 1}
                  </span>
                </div>

                {/* Conditions */}
                <div>
                  <h4 className={`font-bold uppercase mb-1 border-b pb-1 ${theme.borderMuted} ${theme.textBright}`}>
                    Requirements
                  </h4>
                  {selectedNodeData.conditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedNodeData.conditions.map((c) => (
                        <span
                          key={c.id}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${theme.badgeSecondary}`}
                        >
                          {c.name} {c.level ? `(${c.level})` : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${theme.textMuted}`}>No requirements</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
