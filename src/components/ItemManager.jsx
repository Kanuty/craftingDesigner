import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Box, Leaf, Flame, Gem, Mountain,
  Wine, Shield, Sword, FlaskConical, FlaskRound, Bone, Cpu, Cog, Zap, Skull,
  ChevronRight, Info
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Box', icon: Box },
  { name: 'Leaf', icon: Leaf },
  { name: 'Flame', icon: Flame },
  { name: 'Gem', icon: Gem },
  { name: 'Mountain', icon: Mountain },
  { name: 'Wine', icon: Wine },
  { name: 'Shield', icon: Shield },
  { name: 'Sword', icon: Sword },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'FlaskRound', icon: FlaskRound },
  { name: 'Bone', icon: Bone },
  { name: 'Cpu', icon: Cpu },
  { name: 'Cog', icon: Cog },
  { name: 'Zap', icon: Zap },
  { name: 'Skull', icon: Skull },
];

export function getItemIconComponent(iconName) {
  const match = ICON_OPTIONS.find(opt => opt.name === iconName);
  return match ? match.icon : Box;
}

export function ItemManager({ items, setItems, recipes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Raw',
    icon: 'Box',
    description: '',
    tier: 1
  });

  const categories = ['All', 'Raw', 'Intermediate', 'Finished'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      name: '',
      category: 'Raw',
      icon: 'Box',
      description: '',
      tier: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category || 'Raw',
      icon: item.icon || 'Box',
      description: item.description || '',
      tier: item.tier || 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = (itemId, e) => {
    if (e) e.stopPropagation();
    const usedInRecipes = recipes.some(
      r => r.outputItemId === itemId || (r.inputs || r.ingredients || []).some(inp => (inp.itemId || inp.id) === itemId)
    );

    if (usedInRecipes) {
      if (!window.confirm('This item is currently referenced in one or more recipes. Deleting it may impact recipe integrity. Do you wish to continue?')) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setItems(items.filter(i => i.id !== itemId));
    if (selectedItem?.id === itemId) setSelectedItem(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      const updated = { ...formData, id: editingItem.id };
      setItems(items.map(item => item.id === editingItem.id ? updated : item));
      if (selectedItem?.id === editingItem.id) setSelectedItem(updated);
    } else {
      const newId = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '_')
        : formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      if (items.some(i => i.id === newId)) {
        alert('An item with this ID already exists. Please choose another name or ID.');
        return;
      }

      const newItem = { ...formData, id: newId };
      setItems([...items, newItem]);
      setSelectedItem(newItem);
    }

    setIsModalOpen(false);
  };

  // Compute recipe usage for selected item
  const selectedItemRecipesProducing = selectedItem
    ? recipes.filter(r => r.outputItemId === selectedItem.id)
    : [];
  const selectedItemRecipesUsing = selectedItem
    ? recipes.filter(r => (r.inputs || r.ingredients || []).some(ing => (ing.itemId || ing.id) === selectedItem.id))
    : [];

  return (
    <div className="space-y-4">
      {/* Search & Actions Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Main Excel-like Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table View */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-950/80 uppercase font-semibold text-[10px] text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Icon</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Tier</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                      No matching items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const IconComp = getItemIconComponent(item.icon);
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-950/60 border-l-4 border-l-indigo-500 text-white'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex p-1 rounded bg-slate-800 border border-slate-700">
                            <IconComp className="w-4 h-4 text-indigo-400" />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-100">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                              item.category === 'Raw'
                                ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                                : item.category === 'Intermediate'
                                ? 'bg-sky-900/40 text-sky-300 border border-sky-800/50'
                                : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-sans text-slate-300">
                          {item.tier || 1}
                        </td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">
                          {item.id}
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(item, e)}
                              className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl text-xs text-slate-200">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  {React.createElement(getItemIconComponent(selectedItem.icon), {
                    className: 'w-6 h-6 text-indigo-400'
                  })}
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedItem.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {selectedItem.id}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenEdit(selectedItem, e)}
                  className="px-2.5 py-1 bg-indigo-600/30 border border-indigo-500/50 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Edit Item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                  <span className="font-semibold capitalize text-indigo-300">{selectedItem.category}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px] uppercase">Tier</span>
                  <span className="font-semibold text-slate-200">Level {selectedItem.tier || 1}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Description</span>
                <p className="p-2.5 bg-slate-950 rounded border border-slate-800 italic text-slate-300 leading-relaxed">
                  {selectedItem.description || 'No description provided.'}
                </p>
              </div>

              {/* Recipe Relations */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    Produced By ({selectedItemRecipesProducing.length})
                  </h4>
                  {selectedItemRecipesProducing.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedItemRecipesProducing.map((r) => (
                        <div key={r.id} className="p-1.5 bg-slate-800/80 rounded border border-slate-700 text-amber-300 flex justify-between">
                          <span>{r.name}</span>
                          <span className="text-slate-400 text-[10px]">x{r.outputQuantity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Base raw material (no crafting recipe)</span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-sky-400" />
                    Used in Recipes ({selectedItemRecipesUsing.length})
                  </h4>
                  {selectedItemRecipesUsing.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedItemRecipesUsing.map((r) => (
                        <div key={r.id} className="p-1.5 bg-slate-800/80 rounded border border-slate-700 text-sky-300">
                          {r.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">End-product or unused material</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Box className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-medium">Select an item row in the table to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100">
              {editingItem ? 'Edit Item' : 'Create New Item'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Ore or Silver Sword"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Raw">Raw Material</option>
                    <option value="Intermediate">Intermediate Component</option>
                    <option value="Finished">Finished Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Tier / Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Select Icon
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-900 rounded-lg border border-slate-700">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.icon === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => setFormData({ ...formData, icon: opt.name })}
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        }`}
                        title={opt.name}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Short description or notes about this item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
