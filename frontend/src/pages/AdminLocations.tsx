import { useState, useEffect } from 'react';
import { locationService, type Location } from '../services/locationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';

const BUILDING_SUGGESTIONS = [
  'Academic', 'Residential', 'Administrative', 'Sports', 'Library', 'Canteen', 'Other'
];

export default function AdminLocations() {
  const { showToast } = useToast();

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formBuilding, setFormBuilding] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openAdd = () => {
    setEditId(null);
    setFormName('');
    setFormBuilding('');
    setShowForm(true);
  };

  const openEdit = (loc: Location) => {
    setEditId(loc.id);
    setFormName(loc.name);
    setFormBuilding(loc.building);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return showToast('Location name is required', 'error');
    setIsSaving(true);
    try {
      if (editId) {
        await locationService.update(editId, formName, formBuilding);
        showToast('Location updated', 'success');
      } else {
        await locationService.create(formName, formBuilding);
        showToast('Location added', 'success');
      }
      setShowForm(false);
      fetchLocations();
    } catch (err: any) {
      showToast(err.response?.data || 'Operation failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (loc: Location) => {
    if (!window.confirm(`Delete location "${loc.name}"? This cannot be undone.`)) return;
    try {
      await locationService.delete(loc.id);
      showToast('Location deleted', 'success');
      fetchLocations();
    } catch (err: any) {
      const msg = err.response?.data || 'Cannot delete this location.';
      showToast(typeof msg === 'string' ? msg : 'Cannot delete (issues exist).', 'error');
    }
  };

  // Group by building
  const grouped = locations.reduce<Record<string, Location[]>>((acc, loc) => {
    const key = loc.building || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {});

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchLocations} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Locations</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage campus locations where maintenance issues are reported.
          </p>
        </div>
        <button className="btn-primary self-start" onClick={openAdd}>
          <span className="material-symbols-outlined text-[20px]">add_location</span>
          Add Location
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-6">
          <h3 className="text-headline-md font-bold text-primary mb-4">
            {editId ? 'Edit Location' : 'New Location'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Location Name *</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Block A, Hostel B"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Building / Zone</label>
              <select value={formBuilding} onChange={e => setFormBuilding(e.target.value)} className="input-field">
                <option value="">Select building type...</option>
                {BUILDING_SUGGESTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editId ? 'Save Changes' : 'Add Location')}
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Location Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Locations</p>
          <p className="text-display-lg text-primary font-bold">{locations.length}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">With Issues</p>
          <p className="text-display-lg text-primary font-bold">{locations.filter(l => l.issueCount > 0).length}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Buildings</p>
          <p className="text-display-lg text-primary font-bold">{Object.keys(grouped).length}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Issues</p>
          <p className="text-display-lg text-primary font-bold">{locations.reduce((s, l) => s + l.issueCount, 0)}</p>
        </div>
      </div>

      {/* Locations Table */}
      {locations.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">location_on</span>
          <h3 className="text-headline-md text-primary mb-1">No Locations</h3>
          <p className="text-body-md text-on-surface-variant">Add campus locations to track where issues occur.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Building / Zone</th>
                <th className="p-4 font-semibold">Issues</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-container text-[18px]">location_on</span>
                      </div>
                      <span className="font-semibold text-primary">{loc.name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-body-md text-on-surface-variant">
                    {loc.building || '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-label-sm font-bold ${
                      loc.issueCount > 0 ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {loc.issueCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(loc)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        disabled={loc.issueCount > 0}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={loc.issueCount > 0 ? 'Cannot delete: has issues' : 'Delete'}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
