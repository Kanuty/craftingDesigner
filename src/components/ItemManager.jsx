import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Tag, Box, Leaf, Flame, Gem, Mountain,
  Wine, Shield, Sword, FlaskConical, FlaskRound, Bone, Cpu, Cog, Zap, Skull
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

export function ItemManager({ items, setItems, recipes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleOpenEdit = (item) => {
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

  const handleDelete = (itemId) => {
    // Check if item is used in any recipes
    const usedInRecipes = recipes.some(
      r => r.outputItemId === itemId || r.inputs.some(inp => inp.itemId === itemId)
    );

    if (usedInRecipes) {
      if (!window.confirm('This item is currently referenced in one or more recipes. Deleting it may impact recipe integrity. Do you wish to continue?')) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      // Update
      setItems(items.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      // Create new
      const newId = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '_')
        : formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      if (items.some(i => i.id === newId)) {
        alert('An item with this ID already exists. Please choose another name or ID.');
        return;
      }

      setItems([...items, { ...formData, id: newId }]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-base font-medium">No items found.</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const IconComp = getItemIconComponent(item.icon);
            return (
              <div
                key={item.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        item.category === 'Raw' ? 'bg-amber-950/40 border-amber-800/60 text-amber-400' :
                        item.category === 'Intermediate' ? 'bg-sky-950/40 border-sky-800/60 text-sky-400' :
                        'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                      }`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-base leading-snug">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.category === 'Raw' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' :
                            item.category === 'Intermediate' ? 'bg-sky-900/50 text-sky-300 border border-sky-700/50' :
                            'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-slate-400">Tier {item.tier || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-md transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 mt-2">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>ID: {item.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
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
