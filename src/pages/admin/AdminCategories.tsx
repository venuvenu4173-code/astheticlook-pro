import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, ArrowUp, ArrowDown, FolderTree, Sparkles, RefreshCw } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { generateSlug } from '../../utils/pricing';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cats, prods] = await Promise.all([
      categoryService.getCategories(false),
      productService.getProducts({ onlyActive: false }),
    ]);

    const counts: Record<string, number> = {};
    for (const p of prods) {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    }
    setCategories(cats);
    setProductCounts(counts);
    setLoading(false);
  };

  const handleSeedStandard = async () => {
    setSeeding(true);
    try {
      await categoryService.ensureStandardCategories();
      await loadData();
    } catch (err: any) {
      alert(`Error initializing standard categories: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await categoryService.createCategory({
      name: newName,
      slug: newSlug || generateSlug(newName),
    });

    setNewName('');
    setNewSlug('');
    setShowAddForm(false);
    loadData();
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async (id: string) => {
    await categoryService.updateCategory(id, {
      name: editName,
      slug: editSlug || generateSlug(editName),
    });
    setEditingId(null);
    loadData();
  };

  const handleToggleActive = async (cat: Category) => {
    await categoryService.updateCategory(cat.id, { isActive: !cat.isActive });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await categoryService.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Taxonomy Architecture
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Category Management
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Organize products into curated editorial collections and navigation sectors.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Add New Category Drawer / Box */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in"
        >
          <h3 className="font-serif text-base font-bold text-[#1A1816]">Create New Collection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Category Title
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(generateSlug(e.target.value));
                }}
                placeholder="e.g. Fine Horology"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="fine-horology"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-[#5A5047] hover:bg-[#FAF8F5] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1A1816] text-white text-xs font-semibold rounded-lg hover:bg-[#2C2622]"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Category List Table */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#8C7E74] uppercase tracking-wider font-semibold border-b border-[#E8E2D7]">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4 text-center">Products</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE4]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#8C7E74]">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center space-y-3">
                  <p className="text-xs text-[#8C7E74]">No categories found in the database.</p>
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={handleSeedStandard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622] transition-colors disabled:opacity-50"
                  >
                    {seeding ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Initializing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#E8DEC8]" />
                        <span>Initialize 6 Standard Categories</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => {
                const isEditingThis = editingId === cat.id;
                const count = productCounts[cat.id] || 0;

                return (
                  <tr key={cat.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#8C7E74] w-12">
                      0{idx + 1}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#1A1816]">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-white border border-[#1A1816] rounded text-xs w-full max-w-xs"
                        />
                      ) : (
                        cat.name
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#7A6E65]">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="px-2 py-1 bg-white border border-[#1A1816] rounded text-xs font-mono w-full max-w-xs"
                        />
                      ) : (
                        `/${cat.slug}`
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-[#1A1816]">
                      {count}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cat.isActive ? 'bg-[#F0F7F2] text-[#2E7D44]' : 'bg-[#FAF0ED] text-[#8E3B29]'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isEditingThis ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1.5 text-[#2E7D44] hover:bg-[#F0F7F2] rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-[#8C7E74] hover:bg-[#FAF8F5] rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-[#7A6E65] hover:text-[#1A1816] rounded hover:bg-[#FAF8F5]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-[#7A6E65] hover:text-[#8E3B29] rounded hover:bg-[#FAF0ED]"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
