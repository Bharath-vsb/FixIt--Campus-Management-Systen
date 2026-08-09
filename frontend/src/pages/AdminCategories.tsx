import { useState, useEffect } from 'react';
import { categoryService, type Category } from '../services/categoryService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';

const ICON_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical_services', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'wifi', label: 'Internet' },
  { value: 'chair', label: 'Furniture' },
  { value: 'cleaning_services', label: 'Cleaning' },
  { value: 'handyman', label: 'Equipment' },
  { value: 'security', label: 'Security' },
  { value: 'hotel', label: 'Hostel' },
  { value: 'category', label: 'Other' },
];

export default function AdminCategories() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('category');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditId(null);
    setFormName('');
    setFormIcon('category');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setFormName(cat.name);
    setFormIcon(cat.icon || 'category');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return showToast('Category name is required', 'error');
    setIsSaving(true);
    try {
      if (editId) {
        await categoryService.update(editId, formName, formIcon);
        showToast('Category updated', 'success');
      } else {
        await categoryService.create(formName, formIcon);
        showToast('Category added', 'success');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data || 'Operation failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      await categoryService.delete(cat.id);
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data || 'Cannot delete this category.';
      showToast(typeof msg === 'string' ? msg : 'Cannot delete (issues exist).', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchCategories} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Categories</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage issue categories used across the campus maintenance system.
          </p>
        </div>
        <button className="btn-primary self-start" onClick={openAdd}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-6">
          <h3 className="text-headline-md font-bold text-primary mb-4">
            {editId ? 'Edit Category' : 'New Category'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Plumbing"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Icon</label>
              <select value={formIcon} onChange={e => setFormIcon(e.target.value)} className="input-field">
                {ICON_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editId ? 'Save Changes' : 'Add Category')}
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">category</span>
          <h3 className="text-headline-md text-primary mb-1">No Categories</h3>
          <p className="text-body-md text-on-surface-variant">Add categories to organise campus issues.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-shadow flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container">{cat.icon || 'category'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary text-body-md">{cat.name}</h3>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">
                    {cat.issueCount} issue{cat.issueCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                  title="Delete"
                  disabled={cat.issueCount > 0}
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
