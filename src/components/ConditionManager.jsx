import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, Hammer, Flame, Zap, Anvil,
  FlaskRound, GraduationCap, Award, Compass, Wrench, Sparkles, MapPin,
  X, Box
} from 'lucide-react';
import { useTheme } from '../utils/theme';
import { getItemIconComponent } from './ItemManager';

const CONDITION_ICON_OPTIONS = [
  { name: 'Hammer', icon: Hammer },
  { name: 'Anvil', icon: Anvil },
  { name: 'Flame', icon: Flame },
  { name: 'FlaskRound', icon: FlaskRound },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Award', icon: Award },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Wrench', icon: Wrench },
  { name: 'Compass', icon: Compass },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'MapPin', icon: MapPin },
];

export function getConditionIconComponent(iconName) {
  const match = CONDITION_ICON_OPTIONS.find(opt => opt.name === iconName);
  return match ? match.icon : Hammer;
}

export function ConditionManager({ conditions, setConditions, recipes = [], setRecipes = () => {}, items = [], setItems = () => {} }) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [editingCondition, setEditingCondition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Item/Recipe Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemCreationType, setItemCreationType] = useState('new'); // 'new' or 'existing'
  const [newItemData, setNewItemData] = useState({
    id: '',
    name: '',
    category: 'Intermediate',
    icon: 'Box',
    description: '',
    tier: 1,
    tags: '#station_item'
  });
  const [selectedExistingItemId, setSelectedExistingItemId] = useState('');
  const [stationRecipeData, setStationRecipeData] = useState({
    outputQuantity: 1,
    craftTimeSeconds: 5,
    inputs: [{ itemId: items[0]?.id || '', quantity: 1 }],
    additionalConditionIds: [],
    fuelItemId: '',
    fuelQuantity: 1,
    notes: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'workstation',
    level: 'Basic',
    icon: 'Hammer',
    description: '',
    fuelItemId: '',
    fuelQuantity: 0
  });

  const types = ['All', 'workstation', 'skill', 'environment', 'tool'];

  const getTypeBadgeClass = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'workstation') return theme.entity?.workstation?.tag || theme.badgeSecondary;
    if (t === 'skill') return theme.entity?.skill?.tag || theme.badgeSecondary;
    if (t === 'tool') return theme.entity?.equipment?.tag || theme.badgeSecondary;
    return theme.badgeSecondary;
  };

  const filteredConditions = conditions.filter(cond => {
    const matchesSearch = cond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cond.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cond.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || cond.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingCondition(null);
    setFormData({
      id: '',
      name: '',
      type: 'workstation',
      level: 'Basic',
      icon: 'Hammer',
      description: '',
      fuelItemId: '',
      fuelQuantity: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cond, e) => {
    if (e) e.stopPropagation();
    setEditingCondition(cond);
    setFormData({
      id: cond.id,
      name: cond.name,
      type: cond.type || 'workstation',
      level: cond.level || 'Basic',
      icon: cond.icon || 'Hammer',
      description: cond.description || '',
      fuelItemId: cond.fuelItemId || '',
      fuelQuantity: cond.fuelQuantity || 0
    });
    setIsModalOpen(true);
  };

  // Add Item/Recipe to Station modal handlers
  const handleOpenAddItemModal = () => {
    if (!selectedCondition) return;
    setItemCreationType('new');
    setNewItemData({
      id: '',
      name: '',
      category: 'Intermediate',
      icon: 'Box',
      description: `Crafted at ${selectedCondition.name}`,
      tier: 1,
      tags: '#station_item'
    });
    setSelectedExistingItemId(items[0]?.id || '');
    setStationRecipeData({
      outputQuantity: 1,
      craftTimeSeconds: 5,
      inputs: [{ itemId: items[0]?.id || '', quantity: 1 }],
      additionalConditionIds: [],
      fuelItemId: selectedCondition.fuelItemId || '',
      fuelQuantity: selectedCondition.fuelQuantity || 0,
      notes: `Requires ${selectedCondition.name}`
    });
    setIsAddItemModalOpen(true);
  };

  const handleAddInputToStationRecipe = () => {
    setStationRecipeData(prev => ({
      ...prev,
      inputs: [...prev.inputs, { itemId: items[0]?.id || '', quantity: 1 }]
    }));
  };

  const handleRemoveInputFromStationRecipe = (index) => {
    if (stationRecipeData.inputs.length <= 1) {
      alert('A recipe must have at least one ingredient.');
      return;
    }
    setStationRecipeData(prev => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index)
    }));
  };

  const handleStationRecipeInputChange = (index, field, value) => {
    const updated = [...stationRecipeData.inputs];
    updated[index] = { ...updated[index], [field]: value };
    setStationRecipeData(prev => ({ ...prev, inputs: updated }));
  };

  const handleSaveAddItemToStation = (e) => {
    e.preventDefault();
    if (!selectedCondition) return;

    let targetItemId = selectedExistingItemId;

    if (itemCreationType === 'new') {
      if (!newItemData.name.trim()) {
        alert('Please provide an item name.');
        return;
      }
      const newId = newItemData.id.trim()
        ? newItemData.id.toLowerCase().replace(/\s+/g, '_')
        : newItemData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      if (items.some(i => i.id === newId)) {
        alert('An item with this ID already exists. Please choose another name or ID.');
        return;
      }

      const parsedTags = typeof newItemData.tags === 'string'
        ? newItemData.tags.split(/[\s,]+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`)
        : ['#station_item'];

      const createdItem = {
        id: newId,
        name: newItemData.name.trim(),
        category: newItemData.category,
        icon: newItemData.icon,
        description: newItemData.description,
        tier: Number(newItemData.tier) || 1,
        tags: parsedTags
      };

      setItems([...items, createdItem]);
      targetItemId = newId;
    }

    if (!targetItemId) {
      alert('Please select or create an output item.');
      return;
    }

    const outputItemObj = items.find(i => i.id === targetItemId) || { name: newItemData.name || targetItemId };

    // Construct recipe for this station
    const conditionSet = new Set([selectedCondition.id, ...(stationRecipeData.additionalConditionIds || [])]);
    const recipeId = `recipe_${targetItemId}_${Date.now()}`;

    const newRecipe = {
      id: recipeId,
      name: `Craft ${outputItemObj.name}`,
      outputItemId: targetItemId,
      outputQuantity: Number(stationRecipeData.outputQuantity) || 1,
      craftTimeSeconds: Number(stationRecipeData.craftTimeSeconds) || 1,
      inputs: stationRecipeData.inputs,
      conditionIds: Array.from(conditionSet),
      fuelItemId: stationRecipeData.fuelItemId || '',
      fuelQuantity: Number(stationRecipeData.fuelQuantity) || 0,
      notes: stationRecipeData.notes || `Requires ${selectedCondition.name}`
    };

    setRecipes([...recipes, newRecipe]);
    setIsAddItemModalOpen(false);
    alert(`Successfully added item and recipe requiring ${selectedCondition.name}!`);
  };

  const handleDelete = (condId, e) => {
    if (e) e.stopPropagation();
    const usedInRecipes = recipes.some(r => r.conditionIds && r.conditionIds.includes(condId));

    if (usedInRecipes) {
      if (!window.confirm('This crafting condition is attached to one or more recipes. Deleting it will remove it from those recipes. Do you wish to continue?')) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this condition?')) {
      return;
    }

    setConditions(conditions.filter(c => c.id !== condId));
    if (selectedCondition?.id === condId) setSelectedCondition(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCondition) {
      const updated = { ...formData, id: editingCondition.id };
      setConditions(conditions.map(c => c.id === editingCondition.id ? updated : c));
      if (selectedCondition?.id === editingCondition.id) setSelectedCondition(updated);
    } else {
      const newId = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '_')
        : formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      if (conditions.some(c => c.id === newId)) {
        alert('A condition with this ID already exists. Please choose another name or ID.');
        return;
      }

      const newCond = { ...formData, id: newId };
      setConditions([...conditions, newCond]);
      setSelectedCondition(newCond);
    }

    setIsModalOpen(false);
  };

  // Compute recipes requiring selected condition
  const selectedConditionRecipes = selectedCondition
    ? recipes.filter(r => r.conditionIds && r.conditionIds.includes(selectedCondition.id))
    : [];

  return (
    <div className="space-y-4 font-mono">
      {/* Search & Actions Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 rounded-xl border ${theme.panelBg} ${theme.border}`}>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Filter conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs focus:outline-none ${theme.inputBg}`}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded border ${theme.border}`}>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedType === t
                    ? theme.buttonActive
                    : theme.buttonInactive
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${theme.buttonPrimary}`}
        >
          <Plus className="w-4 h-4" />
          Add Condition
        </button>
      </div>

      {/* Main Excel-like Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table View */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden ${theme.cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className={theme.tableHeader}>
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Icon</th>
                  <th className="py-2.5 px-3">Condition Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Level / Req</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 text-[11px]">
                {filteredConditions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`py-8 text-center ${theme.textMuted}`}>
                      No matching conditions found.
                    </td>
                  </tr>
                ) : (
                  filteredConditions.map((cond, idx) => {
                    const IconComp = getConditionIconComponent(cond.icon);
                    const isSelected = selectedCondition?.id === cond.id;
                    const rowClass = isSelected
                      ? theme.tableRowSelected
                      : idx % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd;

                    return (
                      <tr
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond)}
                        className={`cursor-pointer transition-colors ${rowClass} ${theme.tableRowHover}`}
                      >
                        <td className="py-2 px-3 text-center">
                          <div className={`inline-flex p-1 rounded border ${theme.border}`}>
                            <IconComp className={`w-4 h-4 ${theme.accentText}`} />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-semibold">
                          {cond.name}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeBadgeClass(cond.type)}`}>
                            {cond.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {cond.level || 'Basic'}
                        </td>
                        <td className="py-2 px-3 opacity-75 truncate max-w-[120px]">
                          {cond.id}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(cond, e)}
                              className={`p-1 rounded transition-colors ${theme.buttonSecondary}`}
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(cond.id, e)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-900/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Excel Details Inspector Panel */}
        <div className={`rounded-xl border p-4 shadow-xl text-xs ${theme.cardBg}`}>
          {selectedCondition ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b pb-3 ${theme.borderMuted}`}>
                <div className="flex items-center gap-2.5">
                  {React.createElement(getConditionIconComponent(selectedCondition.icon), {
                    className: `w-6 h-6 ${theme.accentText}`
                  })}
                  <div>
                    <h3 className={`text-base font-bold uppercase tracking-wide ${theme.textBright}`}>{selectedCondition.name}</h3>
                    <span className={`text-[10px] opacity-75`}>ID: {selectedCondition.id}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenEdit(selectedCondition, e)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${theme.buttonSecondary}`}
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  <span className={`block text-[10px] uppercase font-bold ${theme.textMuted}`}>Type</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-block mt-1 ${getTypeBadgeClass(selectedCondition.type)}`}>
                    {selectedCondition.type}
                  </span>
                </div>
                <div className={`p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  <span className={`block text-[10px] uppercase font-bold ${theme.textMuted}`}>Level / Req</span>
                  <span className="font-bold text-sm block mt-1">{selectedCondition.level || 'Basic'}</span>
                </div>
              </div>

              {/* Optional Fuel Requirement Badge */}
              {selectedCondition.fuelItemId && (
                <div className={`p-2.5 rounded border flex items-center justify-between ${theme.panelBg} ${theme.border}`}>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className={`block text-[10px] uppercase font-bold ${theme.textMuted}`}>Station Fuel Resource</span>
                      <span className="font-bold text-xs">{selectedCondition.fuelItemId}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${theme.badgePrimary}`}>
                    x{selectedCondition.fuelQuantity || 1} / craft
                  </span>
                </div>
              )}

              <div>
                <span className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>Description</span>
                <p className={`p-2.5 rounded border italic ${theme.panelBg} ${theme.border}`}>
                  {selectedCondition.description || 'No description provided.'}
                </p>
              </div>

              {/* Required By Recipes & Add Item Option */}
              <div className={`space-y-2 pt-2 border-t ${theme.borderMuted}`}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold flex items-center gap-1.5 uppercase text-[11px] ${theme.accentText}`}>
                    <Anvil className="w-3.5 h-3.5" />
                    Required By Recipes ({selectedConditionRecipes.length})
                  </h4>
                  <button
                    onClick={handleOpenAddItemModal}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${theme.buttonPrimary}`}
                    title="Add item/recipe directly to this station or skill"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item to Station
                  </button>
                </div>

                {selectedConditionRecipes.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedConditionRecipes.map((r) => {
                      const outputItem = items.find(i => i.id === r.outputItemId);
                      const OutIcon = outputItem ? getItemIconComponent(outputItem.icon) : Box;
                      return (
                        <div key={r.id} className={`p-2 rounded border text-xs flex items-center justify-between gap-2 ${theme.panelBg} ${theme.border}`}>
                          <div className="flex items-center gap-2 truncate">
                            <OutIcon className={`w-3.5 h-3.5 shrink-0 ${theme.accentText}`} />
                            <span className="font-semibold truncate">{r.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${theme.badgeSecondary}`}>
                            Yield: x{r.outputQuantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className={`text-[11px] block ${theme.textMuted}`}>Not required by any existing recipe</span>
                )}
              </div>
            </div>
          ) : (
            <div className={`py-12 text-center space-y-2 ${theme.textMuted}`}>
              <Anvil className="w-10 h-10 mx-auto opacity-50" />
              <p className="font-medium">Select a condition row in the table to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 ${theme.cardBg} ${theme.border}`}>
            <h2 className={`text-lg font-bold uppercase tracking-wide ${theme.textBright}`}>
              {editingCondition ? 'Edit Condition' : 'Create New Condition'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Condition Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Blacksmith Forge or Alchemy Lv 3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Condition Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  >
                    <option value="workstation">Workstation / Facility</option>
                    <option value="skill">Skill / Research</option>
                    <option value="tool">Required Tool</option>
                    <option value="environment">Environment / Location</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Level / Tier Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tier 2, Lv 5, Researched"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Select Icon
                </label>
                <div className={`grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  {CONDITION_ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.icon === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => setFormData({ ...formData, icon: opt.name })}
                        className={`p-2.5 rounded border flex flex-col items-center justify-center transition-colors ${
                          isSelected
                            ? theme.buttonActive
                            : theme.buttonSecondary
                        }`}
                        title={opt.name}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Fuel Requirement Option */}
              <div className={`p-3 rounded-lg border space-y-2 ${theme.panelBg} ${theme.border}`}>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Station / Skill Fuel Requirement (Optional)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>
                      Fuel Item / Energy Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. coal, dwarven_spirit, energy"
                      value={formData.fuelItemId}
                      onChange={(e) => setFormData({ ...formData, fuelItemId: e.target.value })}
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>
                      Amount / Craft
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fuelQuantity}
                      onChange={(e) => setFormData({ ...formData, fuelQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Details regarding where or how this condition is met..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingCondition ? 'Save Changes' : 'Create Condition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item / Recipe to Station Modal */}
      {isAddItemModalOpen && selectedCondition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${theme.cardBg} ${theme.border}`}>
            <div className="flex justify-between items-center border-b pb-3 border-current/10">
              <div>
                <h2 className={`text-base font-bold uppercase tracking-wide flex items-center gap-2 ${theme.textBright}`}>
                  <Plus className={`w-4 h-4 ${theme.accentText}`} />
                  Add Item & Recipe to Station
                </h2>
                <p className={`text-xs ${theme.textMuted}`}>
                  Station: <strong className={theme.accentText}>{selectedCondition.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddItemToStation} className="space-y-4 text-xs">
              {/* Option Selector: Create New Item vs Select Existing */}
              <div className="space-y-2">
                <label className={`block font-bold uppercase ${theme.textMuted}`}>
                  Output Item Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemCreationType('new')}
                    className={`py-2 px-3 rounded border font-bold uppercase text-center transition-colors cursor-pointer ${
                      itemCreationType === 'new' ? theme.buttonActive : theme.buttonSecondary
                    }`}
                  >
                    + Create New Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemCreationType('existing')}
                    className={`py-2 px-3 rounded border font-bold uppercase text-center transition-colors cursor-pointer ${
                      itemCreationType === 'existing' ? theme.buttonActive : theme.buttonSecondary
                    }`}
                  >
                    Select Existing Item
                  </button>
                </div>
              </div>

              {itemCreationType === 'new' ? (
                <div className={`p-3 rounded-lg border space-y-3 ${theme.panelBg} ${theme.border}`}>
                  <h3 className={`font-bold uppercase text-[11px] ${theme.accentText}`}>New Item Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Item Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Iron Bar or Refined Alloy"
                        value={newItemData.name}
                        onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                        className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Category</label>
                      <select
                        value={newItemData.category}
                        onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                        className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                      >
                        <option value="Raw">Raw Material</option>
                        <option value="Intermediate">Intermediate Component</option>
                        <option value="Finished">Finished Product</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Custom Tags</label>
                      <input
                        type="text"
                        placeholder="#ore, #plants, #trash..."
                        value={newItemData.tags}
                        onChange={(e) => setNewItemData({ ...newItemData, tags: e.target.value })}
                        className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Tier</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newItemData.tier}
                        onChange={(e) => setNewItemData({ ...newItemData, tier: parseInt(e.target.value) || 1 })}
                        className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-3 rounded-lg border space-y-2 ${theme.panelBg} ${theme.border}`}>
                  <label className={`block font-bold uppercase ${theme.textMuted}`}>Target Existing Item</label>
                  <select
                    value={selectedExistingItemId}
                    onChange={(e) => setSelectedExistingItemId(e.target.value)}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recipe Settings */}
              <div className={`p-3 rounded-lg border space-y-3 ${theme.panelBg} ${theme.border}`}>
                <h3 className={`font-bold uppercase text-[11px] ${theme.accentText}`}>Recipe Settings for Station</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Output Yield Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={stationRecipeData.outputQuantity}
                      onChange={(e) => setStationRecipeData({ ...stationRecipeData, outputQuantity: parseInt(e.target.value) || 1 })}
                      className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Craft Time (Sec)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={stationRecipeData.craftTimeSeconds}
                      onChange={(e) => setStationRecipeData({ ...stationRecipeData, craftTimeSeconds: parseFloat(e.target.value) || 0 })}
                      className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                </div>

                {/* Recipe Ingredients */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`font-bold uppercase ${theme.textMuted}`}>Input Ingredients</label>
                    <button
                      type="button"
                      onClick={handleAddInputToStationRecipe}
                      className={`text-xs font-bold uppercase flex items-center gap-1 ${theme.accentText}`}
                    >
                      <Plus className="w-3 h-3" /> Add Ingredient
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {stationRecipeData.inputs.map((inp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={inp.itemId}
                          onChange={(e) => handleStationRecipeInputChange(idx, 'itemId', e.target.value)}
                          className={`flex-1 rounded px-2.5 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                        >
                          {items.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={inp.quantity}
                          onChange={(e) => handleStationRecipeInputChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className={`w-16 rounded px-2 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveInputFromStationRecipe(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-900/30 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Fuel */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Fuel Item (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. coal or dwarven_spirit"
                      value={stationRecipeData.fuelItemId}
                      onChange={(e) => setStationRecipeData({ ...stationRecipeData, fuelItemId: e.target.value })}
                      className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${theme.textMuted} mb-1`}>Fuel Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={stationRecipeData.fuelQuantity}
                      onChange={(e) => setStationRecipeData({ ...stationRecipeData, fuelQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                      className={`w-full rounded px-2.5 py-1.5 focus:outline-none ${theme.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className={`px-4 py-2 rounded text-xs border ${theme.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-xs ${theme.buttonPrimary}`}
                >
                  Add Item & Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
