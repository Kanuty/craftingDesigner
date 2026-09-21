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
  Sparkles,
  Zap,
  Info,
  Sliders,
  Layers,
  ChevronRight,
  Maximize2,
  Box,
  Wrench,
  BookOpen,
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
  Zap,
  Cog,
  Cpu,
  FlaskRound,
  Anvil,
  GraduationCap,
  Award,
};

function renderItemIcon(iconName, defaultClass = "w-5 h-5 text-amber-400") {
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

  const categoryColors = {
    raw: 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200',
    intermediate: 'bg-blue-950/70 border-blue-500/60 text-blue-200',
    finished: 'bg-purple-950/70 border-purple-500/60 text-purple-200',
  };

  const badgeColors = {
    raw: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    finished: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  const categoryKey = (item?.category || '').toLowerCase();

  return (
    <div
      className={`px-4 py-3 rounded-xl border backdrop-blur-md transition-all shadow-xl min-w-[190px] max-w-[230px] ${
        selected
          ? 'ring-2 ring-amber-400 border-amber-400 scale-105 shadow-amber-500/20'
          : categoryColors[categoryKey] || 'bg-slate-800/80 border-slate-700 text-slate-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-amber-400 !w-3 !h-3 !border-2 !border-slate-900"
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center justify-center">
          {renderItemIcon(item?.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-100 truncate">{item?.name}</div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize inline-block mt-0.5 ${
              badgeColors[categoryKey] || 'bg-slate-700 text-slate-300'
            }`}
          >
            {item?.category || 'Item'}
          </span>
        </div>
      </div>

      {item?.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 border-t border-slate-700/50 pt-1">
          {item.description}
        </p>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-700/40">
        <span>In: {recipesProducing?.length || 0} recipes</span>
        <span>Out: {recipesUsing?.length || 0} recipes</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-amber-400 !w-3 !h-3 !border-2 !border-slate-900"
      />
    </div>
  );
};

// Custom Node for Recipes/Crafting Operations
const CustomRecipeNode = ({ data, selected }) => {
  const { recipe, conditions } = data;

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border backdrop-blur-md transition-all shadow-md min-w-[160px] max-w-[210px] ${
        selected
          ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/40'
          : 'bg-slate-900/90 border-amber-500/40 text-amber-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="ingredients"
        className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-900"
      />

      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-amber-500/20 text-amber-400">
          <Hammer className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs text-amber-100 truncate">{recipe?.name}</div>
          <div className="text-[10px] text-amber-400/80">Yield: x{recipe?.outputQuantity || 1}</div>
        </div>
      </div>

      {/* Required Conditions / Workstations */}
      {conditions && conditions.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-amber-500/20 flex flex-wrap gap-1">
          {conditions.map((cond) => (
            <span
              key={cond.id}
              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1"
            >
              <Wrench className="w-2.5 h-2.5" />
              {cond.name}
              {cond.level ? ` (${cond.level})` : ''}
            </span>
          ))}
        </div>
      )}

      {(recipe?.craftTimeSeconds > 0 || recipe?.craftingTime > 0) && (
        <div className="text-[9px] text-slate-400 mt-1 text-right">
          ⏱️ {recipe.craftTimeSeconds || recipe.craftingTime}s
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-900"
      />
    </div>
  );
};

const nodeTypes = {
  itemNode: CustomItemNode,
  recipeNode: CustomRecipeNode,
};

export default function TechTreeGraph({ items = [], recipes = [], conditions = [] }) {
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterConditionId, setFilterConditionId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);

  // Helper to extract inputs array regardless of schema variant
  const getRecipeInputs = (recipe) => recipe.inputs || recipe.ingredients || [];

  // Generate Graph Nodes & Edges automatically based on dependency tree depth
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!items.length) return { nodes: [], edges: [] };

    const itemMap = new Map(items.map((i) => [i.id, i]));
    const conditionMap = new Map(conditions.map((c) => [c.id, c]));

    // Filter recipes based on tag / condition selection
    const eligibleRecipes = recipes.filter((recipe) => {
      if (filterConditionId === 'all') return true;
      return (recipe.conditionIds || []).includes(filterConditionId);
    });

    // Calculate depth for items
    const itemDepths = new Map();
    const recipeDepths = new Map();

    // Raw items get depth 0
    items.forEach((item) => {
      if ((item.category || '').toLowerCase() === 'raw') {
        itemDepths.set(item.id, 0);
      }
    });

    // Iteratively resolve depths for recipes and produced items
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

            // Output item depth
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

    // Default depth for remaining unconnected items
    items.forEach((item) => {
      if (itemDepths.get(item.id) === undefined) {
        const cat = (item.category || '').toLowerCase();
        itemDepths.set(item.id, cat === 'finished' ? 4 : cat === 'intermediate' ? 2 : 0);
      }
    });

    // Organize into column layers
    const layerXSpacing = 320;
    const layerYSpacing = 130;
    const layerCounters = new Map();

    const getNextPos = (depth) => {
      const currentCount = layerCounters.get(depth) || 0;
      layerCounters.set(depth, currentCount + 1);
      return {
        x: depth * layerXSpacing + 50,
        y: currentCount * layerYSpacing + 50,
      };
    };

    const graphNodes = [];
    const graphEdges = [];

    // Filter items based on search/category if applied
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

    // Create Item Nodes
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
        },
      });
    });

    // Create Recipe Nodes and Edges
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
        },
      });

      // Connect Ingredient Items -> Recipe Node
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
            style: { stroke: '#38bdf8', strokeWidth: 2 },
            labelStyle: { fill: '#38bdf8', fontSize: 10, fontWeight: 600 },
            labelBgStyle: { fill: '#0f172a', rx: 4, ry: 4 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
          });
        }
      });

      // Connect Recipe Node -> Produced Item Node
      graphEdges.push({
        id: `edge-${recipe.id}-to-${recipe.outputItemId}`,
        source: recipeNodeId,
        target: `item-${recipe.outputItemId}`,
        sourceHandle: 'output',
        targetHandle: 'input',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      });
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [items, recipes, conditions, filterCategory, filterConditionId, searchTerm]);

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
    <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
      {/* Top Filter Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Recipe & Tech Tree Graph
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive node graph showing dependencies, workstations, and craft pathways
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
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="raw">Raw Materials</option>
            <option value="intermediate">Intermediate Components</option>
            <option value="finished">Finished Products</option>
          </select>

          {/* Workstation / Tag Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filterConditionId}
              onChange={(e) => setFilterConditionId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-medium"
            >
              <option value="all" className="bg-slate-900">All Workstations / Skills</option>
              {conditions.map((cond) => (
                <option key={cond.id} value={cond.id} className="bg-slate-900">
                  {cond.name} ({cond.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showLegend
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
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
          colorMode="dark"
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200" />
          <MiniMap
            className="!bg-slate-900/90 !border-slate-800 !rounded-lg overflow-hidden"
            nodeColor={(node) => {
              if (node.type === 'itemNode') {
                const cat = (node.data.item?.category || '').toLowerCase();
                if (cat === 'raw') return '#10b981';
                if (cat === 'intermediate') return '#3b82f6';
                if (cat === 'finished') return '#a855f7';
              }
              if (node.type === 'recipeNode') return '#f59e0b';
              return '#64748b';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
          />
        </ReactFlow>

        {/* Color Legend Overlay */}
        {showLegend && (
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md z-20 text-xs text-slate-200 space-y-2 max-w-xs">
            <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>Graph Node Legend</span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-500 hover:text-slate-300 text-[10px]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 inline-block"></span>
                <span>Raw Material</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 border border-blue-400 inline-block"></span>
                <span>Intermediate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500 border border-purple-400 inline-block"></span>
                <span>Finished Product</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400 inline-block"></span>
                <span>Recipe Craft</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
              • Arrows show flow from Ingredients → Recipe → Output.
            </div>
          </div>
        )}

        {/* Selected Node Details Side Panel */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 w-80 bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20 text-slate-200">
            <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2 text-base">
                {selectedNodeData.item ? (
                  <>
                    <span className="p-1 rounded bg-slate-800 border border-slate-700 inline-flex items-center">
                      {renderItemIcon(selectedNodeData.item.icon, "w-4 h-4 text-amber-400")}
                    </span>
                    {selectedNodeData.item.name}
                  </>
                ) : (
                  <>
                    <Hammer className="w-4 h-4 text-amber-400" />
                    {selectedNodeData.recipe?.name}
                  </>
                )}
              </h3>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {selectedNodeData.item && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Category: </span>
                  <span className="font-semibold capitalize text-amber-300">
                    {selectedNodeData.item.category}
                  </span>
                </div>
                {selectedNodeData.item.description && (
                  <p className="text-slate-300 italic">{selectedNodeData.item.description}</p>
                )}

                {/* Produced by */}
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">
                    Produced By ({selectedNodeData.recipesProducing?.length || 0} recipes)
                  </h4>
                  {selectedNodeData.recipesProducing?.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNodeData.recipesProducing.map((r) => (
                        <div key={r.id} className="p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
                          <div className="font-medium text-amber-300">{r.name}</div>
                          <div className="text-[10px] text-slate-400">Yield: x{r.outputQuantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">Base material (No recipe)</span>
                  )}
                </div>

                {/* Used in */}
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">
                    Used In ({selectedNodeData.recipesUsing?.length || 0} recipes)
                  </h4>
                  {selectedNodeData.recipesUsing?.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNodeData.recipesUsing.map((r) => (
                        <div key={r.id} className="p-1.5 rounded bg-slate-800/60 border border-slate-700/50">
                          <div className="font-medium text-sky-300">{r.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">End product (Not used in other recipes)</span>
                  )}
                </div>
              </div>
            )}

            {selectedNodeData.recipe && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Crafting Time: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedNodeData.recipe.craftTimeSeconds || selectedNodeData.recipe.craftingTime || 0} seconds
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Yield Output: </span>
                  <span className="font-semibold text-amber-300">
                    x{selectedNodeData.recipe.outputQuantity || 1}
                  </span>
                </div>

                {/* Conditions */}
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">
                    Workstation / Skill Requirements
                  </h4>
                  {selectedNodeData.conditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedNodeData.conditions.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px]"
                        >
                          {c.name} {c.level ? `(${c.level})` : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">No workstation requirements</span>
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
