import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Box, Leaf, Flame, Gem, Mountain,
  Wine, Shield, Sword, FlaskConical, FlaskRound, Bone, Cpu, Cog, Zap, Skull,
  Info, Tag, X
} from 'lucide-react';
import { useTheme } from '../utils/theme';

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
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
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
    tier: 1,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const categories = ['All', 'Raw', 'Intermediate', 'Finished'];

  // Collect all unique tags across items
  const allUniqueTags = Array.from(
    new Set(
      items.flatMap(item => (Array.isArray(item.tags) ? item.tags : []))
    )
  );

  const getCategoryBadgeClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'raw') return theme.entity?.rawMaterial?.tag || theme.badgeSecondary;
    if (cat === 'intermediate') return theme.entity?.intermediate?.tag || theme.badgeSecondary;
    if (cat === 'finished') return theme.entity?.craftable?.tag || theme.badgeSecondary;
    return theme.badgeSecondary;
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const itemTags = Array.isArray(item.tags) ? item.tags : [];
    const matchesSearch = item.name.toLowerCase().includes(searchLower) ||
                          item.description?.toLowerCase().includes(searchLower) ||
                          item.id.toLowerCase().includes(searchLower) ||
                          itemTags.some(t => t.toLowerCase().includes(searchLower));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || itemTags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      name: '',
      category: 'Raw',
      icon: 'Box',
      description: '',
      tier: 1,
      tags: []
    });
    setTagInput('');
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
      tier: item.tier || 1,
      tags: Array.isArray(item.tags) ? [...item.tags] : []
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleAddTag = (tagToAdd) => {
    const raw = (tagToAdd || tagInput).trim();
    if (!raw) return;
    const formatted = raw.startsWith('#') ? raw : `#${raw}`;
    if (!formData.tags.includes(formatted)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, formatted] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
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
    <div className="space-y-4 font-mono">
      {/* Search & Actions Control Bar */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 rounded-xl border ${theme.panelBg} ${theme.border}`}>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Filter items or #tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs focus:outline-none ${theme.inputBg}`}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded border ${theme.border}`}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? theme.buttonActive
                    : theme.buttonInactive
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tag Filter Selector */}
          {allUniqueTags.length > 0 && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${theme.border} ${theme.inputBg}`}>
              <Tag className="w-3.5 h-3.5 opacity-70" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-xs focus:outline-none font-bold"
              >
                <option value="All">All Tags</option>
                {allUniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleOpenAdd}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${theme.buttonPrimary}`}
        >
          <Plus className="w-4 h-4" />
          Add Item
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
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Tier</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10 text-[11px]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`py-8 text-center ${theme.textMuted}`}>
                      No matching items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const IconComp = getItemIconComponent(item.icon);
                    const isSelected = selectedItem?.id === item.id;
                    const rowClass = isSelected
                      ? theme.tableRowSelected
                      : idx % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer transition-colors ${rowClass} ${theme.tableRowHover}`}
                      >
                        <td className="py-2 px-3 text-center">
                          <div className={`inline-flex p-1 rounded border ${theme.border}`}>
                            <IconComp className={`w-4 h-4 ${theme.accentText}`} />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-semibold">
                          <div>{item.name}</div>
                          {Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.tags.map(t => (
                                <span key={t} className="text-[9px] px-1 py-0.2 rounded border border-current/30 font-bold opacity-80">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          T{item.tier || 1}
                        </td>
                        <td className={`py-2 px-3 opacity-75 truncate max-w-[120px]`}>
                          {item.id}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(item, e)}
                              className={`p-1 rounded transition-colors ${theme.buttonSecondary}`}
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className={`p-1 rounded text-rose-500 hover:bg-rose-900/30 transition-colors`}
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
          {selectedItem ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b pb-3 ${theme.borderMuted}`}>
                <div className="flex items-center gap-2.5">
                  {React.createElement(getItemIconComponent(selectedItem.icon), {
                    className: `w-6 h-6 ${theme.accentText}`
                  })}
                  <div>
                    <h3 className={`text-base font-bold uppercase tracking-wide ${theme.textBright}`}>{selectedItem.name}</h3>
                    <span className={`text-[10px] opacity-75`}>ID: {selectedItem.id}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenEdit(selectedItem, e)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${theme.buttonSecondary}`}
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  <span className={`block text-[10px] uppercase font-bold ${theme.textMuted}`}>Category</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-block mt-1 ${getCategoryBadgeClass(selectedItem.category)}`}>
                    {selectedItem.category}
                  </span>
                </div>
                <div className={`p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  <span className={`block text-[10px] uppercase font-bold ${theme.textMuted}`}>Tier</span>
                  <span className="font-bold text-sm block mt-1">Level {selectedItem.tier || 1}</span>
                </div>
              </div>

              {/* Custom Tags Section in Inspector */}
              <div>
                <span className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>Custom Tags</span>
                {Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(t => (
                      <span key={t} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${theme.badgeSecondary}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={`text-[11px] italic ${theme.textMuted}`}>No custom tags assigned</span>
                )}
              </div>

              <div>
                <span className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>Description</span>
                <p className={`p-2.5 rounded border italic ${theme.panelBg} ${theme.border}`}>
                  {selectedItem.description || 'No description provided.'}
                </p>
              </div>

              {/* Recipe Relations */}
              <div className={`space-y-2 pt-2 border-t ${theme.borderMuted}`}>
                <div>
                  <h4 className={`font-bold mb-1 flex items-center gap-1.5 uppercase text-[11px] ${theme.accentText}`}>
                    <Info className="w-3.5 h-3.5" />
                    Produced By ({selectedItemRecipesProducing.length})
                  </h4>
                  {selectedItemRecipesProducing.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedItemRecipesProducing.map((r) => (
                        <div key={r.id} className={`p-1.5 rounded border text-xs flex justify-between ${theme.panelBg} ${theme.border}`}>
                          <span className="font-semibold">{r.name}</span>
                          <span className="font-bold opacity-75">x{r.outputQuantity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${theme.textMuted}`}>Base raw material (no recipe)</span>
                  )}
                </div>

                <div>
                  <h4 className={`font-bold mb-1 flex items-center gap-1.5 uppercase text-[11px] ${theme.accentText}`}>
                    <Box className="w-3.5 h-3.5" />
                    Used in Recipes ({selectedItemRecipesUsing.length})
                  </h4>
                  {selectedItemRecipesUsing.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedItemRecipesUsing.map((r) => (
                        <div key={r.id} className={`p-1.5 rounded border text-xs ${theme.panelBg} ${theme.border}`}>
                          {r.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${theme.textMuted}`}>End-product or unused material</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`py-12 text-center space-y-2 ${theme.textMuted}`}>
              <Box className="w-10 h-10 mx-auto opacity-50" />
              <p className="font-medium">Select an item row in the table to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 ${theme.cardBg} ${theme.border}`}>
            <h2 className={`text-lg font-bold uppercase tracking-wide ${theme.textBright}`}>
              {editingItem ? 'Edit Item' : 'Create New Item'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Ore or Silver Sword"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  >
                    <option value="Raw">Raw Material</option>
                    <option value="Intermediate">Intermediate Component</option>
                    <option value="Finished">Finished Product</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                    Tier / Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) || 1 })}
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Select Icon
                </label>
                <div className={`grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 rounded border ${theme.panelBg} ${theme.border}`}>
                  {ICON_OPTIONS.map((opt) => {
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

              {/* Custom Tags Field */}
              <div className={`p-3 rounded-lg border space-y-2 ${theme.panelBg} ${theme.border}`}>
                <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                  Custom Tags (e.g. #ore, #plants, #trash)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a tag and press enter or click Add..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className={`flex-1 rounded px-2.5 py-1.5 text-xs focus:outline-none ${theme.inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${theme.buttonSecondary}`}
                  >
                    Add Tag
                  </button>
                </div>

                {/* Display Current Tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${theme.badgeSecondary}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                <div className="pt-1">
                  <span className={`block text-[10px] font-bold uppercase mb-1 ${theme.textMuted}`}>Quick Tag Suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {['#ore', '#plants', '#trash', '#fuel', '#raw', '#component', '#gear'].map(sug => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => handleAddTag(sug)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-current/20 hover:border-current opacity-80"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMuted}`}>
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Short description or notes about this item..."
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
