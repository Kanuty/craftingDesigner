import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, Hammer, Flame, Zap, Anvil,
  FlaskRound, GraduationCap, Award, Compass, Wrench, Sparkles, MapPin
} from 'lucide-react';
import { useTheme } from '../utils/theme';

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
  const { theme } = useTheme();
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

              <div>
                <span className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>Description</span>
                <p className={`p-2.5 rounded border italic ${theme.panelBg} ${theme.border}`}>
                  {selectedCondition.description || 'No description provided.'}
                </p>
              </div>

              {/* Required By Recipes */}
              <div className={`space-y-2 pt-2 border-t ${theme.borderMuted}`}>
                <h4 className={`font-bold mb-1 flex items-center gap-1.5 uppercase text-[11px] ${theme.accentText}`}>
                  <Anvil className="w-3.5 h-3.5" />
                  Required By Recipes ({selectedConditionRecipes.length})
                </h4>
                {selectedConditionRecipes.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedConditionRecipes.map((r) => (
                      <div key={r.id} className={`p-1.5 rounded border text-xs ${theme.panelBg} ${theme.border}`}>
                        {r.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className={`text-[11px] ${theme.textMuted}`}>Not required by any existing recipe</span>
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
    </div>
  );
}
