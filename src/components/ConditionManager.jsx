import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, Hammer, Flame, Zap, Anvil,
  FlaskRound, GraduationCap, Award, Compass, Wrench, Sparkles, MapPin
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

export function ConditionManager({ conditions, setConditions, recipes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
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
                          cond.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleOpenEdit = (cond) => {
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

  const handleDelete = (condId) => {
    // Check if used in recipes
    const usedInRecipes = recipes.some(r => r.conditionIds && r.conditionIds.includes(condId));

    if (usedInRecipes) {
      if (!window.confirm('This crafting condition is attached to one or more recipes. Deleting it will remove it from those recipes. Do you wish to continue?')) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this condition?')) {
      return;
    }

    setConditions(conditions.filter(c => c.id !== condId));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCondition) {
      setConditions(conditions.map(c => c.id === editingCondition.id ? { ...formData, id: c.id } : c));
    } else {
      const newId = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '_')
        : formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      if (conditions.some(c => c.id === newId)) {
        alert('A condition with this ID already exists. Please choose another name or ID.');
        return;
      }

      setConditions([...conditions, { ...formData, id: newId }]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
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
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Condition
        </button>
      </div>

      {/* Grid of Conditions */}
      {filteredConditions.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
          <Anvil className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-base font-medium">No conditions found.</p>
          <p className="text-slate-500 text-xs mt-1">Create workstations, skill requirements, or environment conditions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConditions.map(cond => {
            const IconComp = getConditionIconComponent(cond.icon);
            return (
              <div
                key={cond.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        cond.type === 'workstation' ? 'bg-amber-950/40 border-amber-800/60 text-amber-400' :
                        cond.type === 'skill' ? 'bg-purple-950/40 border-purple-800/60 text-purple-400' :
                        cond.type === 'tool' ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400' :
                        'bg-teal-950/40 border-teal-800/60 text-teal-400'
                      }`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-base leading-snug">{cond.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            cond.type === 'workstation' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' :
                            cond.type === 'skill' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' :
                            cond.type === 'tool' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50' :
                            'bg-teal-900/50 text-teal-300 border border-teal-700/50'
                          }`}>
                            {cond.type}
                          </span>
                          <span className="text-xs text-slate-400">{cond.level}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(cond)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                        title="Edit Condition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cond.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-md transition-colors"
                        title="Delete Condition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 mt-2">
                    {cond.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>ID: {cond.id}</span>
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
