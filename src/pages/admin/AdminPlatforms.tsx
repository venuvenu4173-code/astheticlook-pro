import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Link2, ExternalLink } from 'lucide-react';
import { INITIAL_PLATFORMS } from '../../data/seedData';
import { productService } from '../../services/productService';
import { AffiliatePlatform, Product } from '../../types';

const STORAGE_KEY = 'aesthetic_look_platforms';

export const AdminPlatforms: React.FC = () => {
  const [platforms, setPlatforms] = useState<AffiliatePlatform[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PLATFORMS;
    } catch {
      return INITIAL_PLATFORMS;
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    productService.getProducts({ onlyActive: false }).then(setProducts);
  }, []);

  const savePlatforms = (list: AffiliatePlatform[]) => {
    setPlatforms(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const item: AffiliatePlatform = {
      id: `plat-${Date.now()}`,
      name: newName.trim(),
      tag: newName.trim().toLowerCase().replace(/\s+/g, '-'),
      isActive: true,
    };
    savePlatforms([...platforms, item]);
    setNewName('');
  };

  const handleSaveEdit = (id: string) => {
    savePlatforms(
      platforms.map((p) =>
        p.id === id ? { ...p, name: editName.trim(), tag: editName.trim().toLowerCase().replace(/\s+/g, '-') } : p
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    savePlatforms(platforms.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-[#E8E2D7]">
        <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
          Retailer Integration
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
          Affiliate Platforms & Merchants
        </h1>
        <p className="text-xs text-[#7A6E65] mt-1">
          Configure verified external affiliate partners (Amazon, Flipkart, SSENSE, Farfetch, Zara, etc.).
        </p>
      </div>

      {/* Add Platform Form */}
      <form onSubmit={handleAdd} className="bg-white border border-[#E8E2D7] rounded-2xl p-5 flex gap-3 shadow-sm">
        <input
          type="text"
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New Retailer Name (e.g. MatchesFashion, Myntra, Mr Porter)"
          className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          Add Partner
        </button>
      </form>

      {/* Platforms Table */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#8C7E74] uppercase tracking-wider font-semibold border-b border-[#E8E2D7]">
            <tr>
              <th className="py-3 px-4">Retailer Name</th>
              <th className="py-3 px-4">Tag Identifier</th>
              <th className="py-3 px-4 text-center">Catalog Products</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE4]">
            {platforms.map((plat) => {
              const count = products.filter(
                (p) => p.affiliatePlatform.toLowerCase() === plat.name.toLowerCase()
              ).length;
              const isEditing = editingId === plat.id;

              return (
                <tr key={plat.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#1A1816]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 bg-white border border-[#1A1816] rounded text-xs"
                      />
                    ) : (
                      plat.name
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#7A6E65]">
                    {plat.tag}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#1A1816]">
                    {count}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSaveEdit(plat.id)}
                          className="p-1.5 text-[#2E7D44] hover:bg-[#F0F7F2] rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-[#8C7E74] hover:bg-[#FAF8F5] rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingId(plat.id);
                            setEditName(plat.name);
                          }}
                          className="p-1.5 text-[#7A6E65] hover:text-[#1A1816] rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plat.id)}
                          className="p-1.5 text-[#7A6E65] hover:text-[#8E3B29] rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
