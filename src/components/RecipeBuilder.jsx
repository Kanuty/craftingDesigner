import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Scroll, ArrowRight, Clock, Shield, Hammer,
  X, Check, AlertTriangle, Layers
} from 'lucide-react';
import { getItemIconComponent } from './ItemManager';
import { getConditionIconComponent } from './ConditionManager';

export function RecipeBuilder({ items, conditions, recipes, setRecipes }) {
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <select
            value={selectedOutputFilter}
            onChange={(e) => setSelectedOutputFilter(e.target.value)}
            className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
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
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {/* Recipes List */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
          <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-base font-medium">No crafting recipes found.</p>
          <p className="text-slate-500 text-xs mt-1">Combine base items and conditions to define crafting recipes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecipes.map(recipe => {
            const outputItem = getItemById(recipe.outputItemId);
            const OutputIcon = outputItem ? getItemIconComponent(outputItem.icon) : Scroll;

            return (
              <div
                key={recipe.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
              >
                {/* Left: Recipe Target */}
                <div className="flex items-start gap-4 min-w-[220px]">
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-400">
                    <OutputIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-lg leading-snug">{recipe.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        Yield: {recipe.outputQuantity}x {outputItem ? outputItem.name : recipe.outputItemId}
                      </span>
                      {recipe.craftTimeSeconds && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {recipe.craftTimeSeconds}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Ingredients -> Arrow */}
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
                  {/* Ingredients */}
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Inputs:
                    </span>
                    {recipe.inputs.map((inp, idx) => {
                      const ingredient = getItemById(inp.itemId);
                      const InpIcon = ingredient ? getItemIconComponent(ingredient.icon) : Layers;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200"
                        >
                          <InpIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{ingredient ? ingredient.name : inp.itemId}</span>
                          <span className="bg-indigo-950 text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[10px] ml-1">
                            x{inp.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block shrink-0" />

                  {/* Required Conditions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Conditions:
                    </span>
                    {(!recipe.conditionIds || recipe.conditionIds.length === 0) ? (
                      <span className="text-xs text-slate-500 italic">None Required</span>
                    ) : (
                      recipe.conditionIds.map(condId => {
                        const condition = getConditionById(condId);
                        if (!condition) return null;
                        const CondIcon = getConditionIconComponent(condition.icon);
                        return (
                          <div
                            key={condId}
                            className="flex items-center gap-1 bg-purple-950/60 border border-purple-800/60 px-2 py-1 rounded-md text-[11px] font-medium text-purple-300"
                            title={condition.description}
                          >
                            <CondIcon className="w-3 h-3 text-purple-400" />
                            <span>{condition.name}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(recipe)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit Recipe"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Creating/Editing Recipe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100">
              {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Target Output Item & Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Target Output Item
                  </label>
                  <select
                    value={formData.outputItemId}
                    onChange={(e) => setFormData({ ...formData, outputItemId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Output Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.outputQuantity}
                    onChange={(e) => setFormData({ ...formData, outputQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Recipe Name & Crafting Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Recipe Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Defaults to Craft <Item Name>"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Crafting Time (Sec)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.craftTimeSeconds}
                    onChange={(e) => setFormData({ ...formData, craftTimeSeconds: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Ingredients Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Required Input Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddInput}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Ingredient
                  </button>
                </div>

                <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-700">
                  {formData.inputs.map((inp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={inp.itemId}
                        onChange={(e) => handleInputChange(idx, 'itemId', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
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
                        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveInput(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Crafting Conditions Toggle Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Required Conditions (Workstations, Skills, Tools, Tiers)
                </label>
                {conditions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-lg border border-slate-700">
                    No crafting conditions defined yet. You can add conditions in the Conditions tab.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-slate-900 rounded-lg border border-slate-700">
                    {conditions.map(cond => {
                      const isSelected = formData.conditionIds.includes(cond.id);
                      const CondIcon = getConditionIconComponent(cond.icon);
                      return (
                        <div
                          key={cond.id}
                          onClick={() => toggleCondition(cond.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                            isSelected
                              ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                              : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <div className={`p-1 rounded ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            <CondIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{cond.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{cond.type} • {cond.level}</p>
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional tips or recipe details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer"
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
