import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Scroll, ArrowRight, Clock,
  X, Check, Layers
} from 'lucide-react';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';
import { useTheme } from '../utils/theme';

export function RecipeBuilder({ items, conditions, recipes, setRecipes }) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutputFilter, setSelectedOutputFilter] = useState('All');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    outputItemId: '',
    outputQuantity: 1,
    craftTimeSeconds: 1,
    inputs: [{ itemId: '', quantity: 1 }],
    conditionIds: [],
    notes: ''
  });

  const getItemById = (id) => items.find(i => i.id === id);
  const getConditionById = (id) => conditions.find(c => c.id === id);

  const filteredRecipes = recipes.filter(recipe => {
    const outputItem = getItemById(recipe.outputItemId);
    const recipeName = recipe.name || (outputItem ? `Craft ${outputItem.name}` : '');
    const matchesSearch = recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedOutputFilter === 'All') return matchesSearch;
    return matchesSearch && recipe.outputItemId === selectedOutputFilter;
  });

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setFormData({
      id: '',
      name: '',
      outputItemId: items.length > 0 ? items[0].id : '',
      outputQuantity: 1,
      craftTimeSeconds: 1,
      inputs: [{ itemId: items.length > 0 ? items[0].id : '', quantity: 1 }],
      conditionIds: [],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      id: recipe.id,
      name: recipe.name || '',
      outputItemId: recipe.outputItemId,
      outputQuantity: recipe.outputQuantity || 1,
      craftTimeSeconds: recipe.craftTimeSeconds || 1,
      inputs: recipe.inputs.map(i => ({ ...i })),
      conditionIds: recipe.conditionIds ? [...recipe.conditionIds] : [],
      notes: recipe.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(r => r.id !== recipeId));
    }
  };

  // Form handlers
  const handleAddInput = () => {
    const unusedItem = items.find(i => !formData.inputs.some(inp => inp.itemId === i.id)) || items[0];
    setFormData({
      ...formData,
      inputs: [...formData.inputs, { itemId: unusedItem ? unusedItem.id : '', quantity: 1 }]
    });
  };

  const handleRemoveInput = (index) => {
    if (formData.inputs.length <= 1) {
      alert('A recipe must have at least one ingredient.');
      return;
    }
    setFormData({
      ...formData,
      inputs: formData.inputs.filter((_, i) => i !== index)
    });
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...formData.inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setFormData({ ...formData, inputs: newInputs });
  };

  const toggleCondition = (condId) => {
    const current = formData.conditionIds;
    if (current.includes(condId)) {
      setFormData({ ...formData, conditionIds: current.filter(id => id !== condId) });
    } else {
      setFormData({ ...formData, conditionIds: [...current, condId] });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.outputItemId) {
      alert('Please select an output item.');
      return;
    }

    if (formData.inputs.some(inp => !inp.itemId || inp.quantity <= 0)) {
      alert('Please ensure all input ingredients have a valid item selected and quantity > 0.');
      return;
    }

    const outputItem = getItemById(formData.outputItemId);
    const finalName = formData.name.trim() || `Craft ${outputItem ? outputItem.name : 'Item'}`;

    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...formData, name: finalName, id: r.id } : r));
    } else {
      const newId = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '_')
        : 'recipe_' + Date.now();

      setRecipes([...recipes, { ...formData, name: finalName, id: newId }]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header Actions */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 rounded-xl border ${theme.panelBg} ${theme.border}`}>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs focus:outline-none ${theme.inputBg}`}
            />
          </div>

          <select
            value={selectedOutputFilter}
            onChange={(e) => setSelectedOutputFilter(e.target.value)}
            className={`px-3 py-1.5 rounded text-xs focus:outline-none ${theme.inputBg}`}
          >
            <option value="All">All Crafted Products</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={items.length === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${theme.buttonPrimary} disabled:opacity-50`}
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {/* Recipes List */}
      {filteredRecipes.length === 0 ? (
        <div className={`rounded-xl p-12 text-center border ${theme.cardBg} ${theme.borderMuted}`}>
          <Scroll className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold uppercase tracking-wide">No crafting recipes found.</p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Combine base items and conditions to define crafting recipes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map(recipe => {
            const outputItem = getItemById(recipe.outputItemId);
            const OutputIcon = outputItem ? getItemIconComponent(outputItem.icon) : Scroll;

            return (
              <div
                key={recipe.id}
                className={`rounded-xl border p-4 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${theme.cardBg} ${theme.border}`}
              >
                {/* Left: Recipe Target */}
                <div className="flex items-start gap-3 min-w-[220px]">
                  <div className={`p-2.5 rounded-lg border ${theme.border} ${theme.panelBg}`}>
                    <OutputIcon className={`w-6 h-6 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base uppercase tracking-wide ${theme.textBright}`}>{recipe.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badgePrimary}`}>
                        Yield: {recipe.outputQuantity}x {outputItem ? outputItem.name : recipe.outputItemId}
                      </span>
                      {recipe.craftTimeSeconds && (
                        <span className={`text-[11px] flex items-center gap-1 ${theme.textMuted}`}>
                          <Clock className="w-3 h-3" />
                          {recipe.craftTimeSeconds}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Ingredients -> Arrow */}
                <div className={`flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border ${theme.panelBg} ${theme.border}`}>
                  {/* Ingredients */}
                  <div className="flex-1 flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${theme.textMuted}`}>
                      Inputs:
                    </span>
                    {recipe.inputs.map((inp, idx) => {
                      const ingredient = getItemById(inp.itemId);
                      const InpIcon = ingredient ? getItemIconComponent(ingredient.icon) : Layers;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 border px-2 py-1 rounded text-xs font-semibold ${theme.badgeSecondary}`}
                        >
                          <InpIcon className={`w-3.5 h-3.5 ${theme.accentText}`} />
                          <span>{ingredient ? ingredient.name : inp.itemId}</span>
                          <span className="font-bold ml-1 opacity-80">
                            x{inp.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <ArrowRight className={`w-4 h-4 hidden sm:block shrink-0 ${theme.textMuted}`} />

                  {/* Required Conditions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${theme.textMuted}`}>
                      Conditions:
                    </span>
                    {(!recipe.conditionIds || recipe.conditionIds.length === 0) ? (
                      <span className={`text-xs italic ${theme.textMuted}`}>None</span>
                    ) : (
                      recipe.conditionIds.map(condId => {
                        const condition = getConditionById(condId);
                        if (!condition) return null;
                        const CondIcon = getConditionIconComponent(condition.icon);
                        return (
                          <div
                            key={condId}
                            className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[10px] font-bold uppercase ${theme.badgeSecondary}`}
                            title={condition.description}
                          >
                            <CondIcon className="w-3 h-3" />
                            <span>{condition.name}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(recipe)}
                    className={`p-1.5 rounded border transition-colors ${theme.buttonSecondary}`}
                    title="Edit Recipe"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-1.5 rounded text-rose-500 hover:bg-rose-900/30 transition-colors"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Creating/Editing Recipe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${theme.cardBg} ${theme.border}`}>
            <h2 className={`text-lg font-bold uppercase tracking-wide ${theme.textBright}`}>
              {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Target Output Item & Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Target Output Item
                  </label>
                  <select
                    value={formData.outputItemId}
                    onChange={(e) => setFormData({ ...formData, outputItemId: e.target.value })}
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
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Output Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.outputQuantity}
                    onChange={(e) => setFormData({ ...formData, outputQuantity: parseInt(e.target.value) || 1 })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>
              </div>

              {/* Recipe Name & Crafting Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Recipe Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Defaults to Craft <Item Name>"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Crafting Time (Sec)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.craftTimeSeconds}
                    onChange={(e) => setFormData({ ...formData, craftTimeSeconds: parseFloat(e.target.value) || 0 })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>
              </div>

              {/* Ingredients Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                    Required Input Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddInput}
                    className={`flex items-center gap-1 text-xs font-bold uppercase ${theme.accentText}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Ingredient
                  </button>
                </div>

                <div className={`space-y-2 p-3 rounded border ${theme.panelBg} ${theme.border}`}>
                  {formData.inputs.map((inp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={inp.itemId}
                        onChange={(e) => handleInputChange(idx, 'itemId', e.target.value)}
                        className={`flex-1 rounded px-3 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                      >
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={inp.quantity}
                        onChange={(e) => handleInputChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className={`w-20 rounded px-2 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveInput(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-900/30 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Crafting Conditions Toggle Selection */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textMuted}`}>
                  Required Conditions (Workstations, Skills, Tools, Tiers)
                </label>
                {conditions.length === 0 ? (
                  <p className={`text-xs italic p-3 rounded border ${theme.panelBg} ${theme.border} ${theme.textMuted}`}>
                    No crafting conditions defined yet.
                  </p>
                ) : (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                    {conditions.map(cond => {
                      const isSelected = formData.conditionIds.includes(cond.id);
                      const CondIcon = getConditionIconComponent(cond.icon);
                      return (
                        <div
                          key={cond.id}
                          onClick={() => toggleCondition(cond.id)}
                          className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer select-none transition-colors ${
                            isSelected
                              ? theme.buttonActive
                              : theme.buttonSecondary
                          }`}
                        >
                          <div className="p-1 rounded border border-current">
                            <CondIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{cond.name}</p>
                            <p className="text-[10px] opacity-75 capitalize">{cond.type} • {cond.level}</p>
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border border-current`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional tips or recipe details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded text-xs border ${theme.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-xs ${theme.buttonPrimary}`}
                >
                  {editingRecipe ? 'Save Changes' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
