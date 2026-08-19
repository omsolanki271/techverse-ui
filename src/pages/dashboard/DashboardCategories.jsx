import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const DashboardCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, { categoryTitle: title, categoryDescription: description });
        toast.success('Category updated');
      } else {
        await categoryService.createCategory({ categoryTitle: title, categoryDescription: description });
        toast.success('Category created');
      }
      setTitle('');
      setDescription('');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.categoryId);
    setTitle(cat.categoryTitle);
    setDescription(cat.categoryDescription);
  };

  const handleDelete = async (categoryId) => {
    if (!(await confirm('Are you sure you want to delete this category?'))) return;
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(categories.filter(c => c.categoryId !== categoryId));
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-techverse-olive"></div></div>;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-techverse-green">Categories</h1>
          <p className="text-techverse-green/70">Create and manage content categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6">
            <h3 className="text-lg font-bold text-techverse-green mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-techverse-green mb-1">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-techverse-green/20 rounded-md focus:outline-none focus:ring-2 focus:ring-techverse-olive text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-techverse-green mb-1">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-techverse-green/20 rounded-md focus:outline-none focus:ring-2 focus:ring-techverse-olive text-sm resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }} className="btn-outline px-4 py-2 text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-techverse-eggshell/50 border-b border-techverse-green/10 text-sm">
                  <th className="p-4 font-bold text-techverse-green uppercase">ID</th>
                  <th className="p-4 font-bold text-techverse-green uppercase">Title</th>
                  <th className="p-4 font-bold text-techverse-green uppercase">Description</th>
                  <th className="p-4 font-bold text-techverse-green uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.categoryId} className="border-b border-techverse-green/5 hover:bg-techverse-eggshell/20">
                    <td className="p-4 text-sm text-techverse-green/70">{c.categoryId}</td>
                    <td className="p-4 font-medium text-techverse-green">{c.categoryTitle}</td>
                    <td className="p-4 text-sm text-techverse-green/80 max-w-[200px] truncate">{c.categoryDescription}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(c)} className="p-2 text-techverse-olive hover:bg-techverse-olive/10 rounded-full transition-colors inline-block mr-2">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.categoryId)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors inline-block">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {categories.length === 0 && <div className="p-8 text-center text-techverse-green/60">No categories found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategories;
