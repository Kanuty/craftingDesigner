import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, Hammer, Flame, Zap, Anvil,
  FlaskRound, GraduationCap, Award, Compass, Wrench, Sparkles, MapPin, Info
} from 'lucide-react';

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

export function ConditionManager({ conditions, setConditions, recipes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [editingCondition, setEditingCondition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'workstation',
    level: 'Basic',
    icon: 'Hammer',
    description: ''
  });

  const types = ['All', 'workstation', 'skill', 'environment', 'tool'];

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
      description: ''
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
      description: cond.description || ''
    });
    setIsModalOpen(true);
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
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Condition
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
                  <th className="py-2.5 px-3">Condition Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Level / Requirement</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredConditions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                      No matching conditions found.
                    </td>
                  </tr>
                ) : (
                  filteredConditions.map((cond) => {
                    const IconComp = getConditionIconComponent(cond.icon);
                    const isSelected = selectedCondition?.id === cond.id;
                    return (
                      <tr
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-purple-950/60 border-l-4 border-l-purple-500 text-white'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex p-1 rounded bg-slate-800 border border-slate-700">
                            <IconComp className="w-4 h-4 text-purple-400" />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-100">
                          {cond.name}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                              cond.type === 'workstation'
                                ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                                : cond.type === 'skill'
                                ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50'
                                : cond.type === 'tool'
                                ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50'
                                : 'bg-teal-900/40 text-teal-300 border border-teal-800/50'
                            }`}
                          >
                            {cond.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300">
                          {cond.level || 'Basic'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">
                          {cond.id}
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(cond, e)}
                              className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(cond.id, e)}
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
          {selectedCondition ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  {React.createElement(getConditionIconComponent(selectedCondition.icon), {
                    className: 'w-6 h-6 text-purple-400'
                  })}
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedCondition.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {selectedCondition.id}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenEdit(selectedCondition, e)}
                  className="px-2.5 py-1 bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600 text-purple-200 hover:text-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Edit Condition
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px] uppercase">Type</span>
                  <span className="font-semibold capitalize text-purple-300">{selectedCondition.type}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px] uppercase">Level / Level Tag</span>
                  <span className="font-semibold text-slate-200">{selectedCondition.level || 'Basic'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Description</span>
                <p className="p-2.5 bg-slate-950 rounded border border-slate-800 italic text-slate-300 leading-relaxed">
                  {selectedCondition.description || 'No description provided.'}
                </p>
              </div>

              {/* Required By Recipes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Anvil className="w-3.5 h-3.5 text-purple-400" />
                  Required By Recipes ({selectedConditionRecipes.length})
                </h4>
                {selectedConditionRecipes.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedConditionRecipes.map((r) => (
                      <div key={r.id} className="p-1.5 bg-slate-800/80 rounded border border-slate-700 text-purple-300">
                        {r.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 text-[11px]">Not required by any existing recipe</span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Anvil className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-medium">Select a condition row in the table to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100">
              {editingCondition ? 'Edit Condition' : 'Create New Condition'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Condition Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Blacksmith Forge or Alchemy Lv 3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Condition Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="workstation">Workstation / Facility</option>
                    <option value="skill">Skill / Research</option>
                    <option value="tool">Required Tool</option>
                    <option value="environment">Environment / Location</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Level / Tier Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tier 2, Lv 5, Researched"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-900 rounded-lg border border-slate-700">
                  {CONDITION_ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.icon === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => setFormData({ ...formData, icon: opt.name })}
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-purple-300'
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
                  placeholder="Details regarding where or how this condition is met..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  {editingCondition ? 'Save Changes' : 'Create Condition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
