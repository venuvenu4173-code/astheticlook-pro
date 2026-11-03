import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  CheckCircle,
  EyeOff,
  AlertTriangle,
  X,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatPrice } from '../../utils/pricing';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      productService.getProducts({ onlyActive: false }),
      categoryService.getCategories(false),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleToggleActive = async (product: Product) => {
    await productService.updateProduct(product.id, { isActive: !product.isActive });
    showNotice(`Product "${product.name}" is now ${!product.isActive ? 'Active' : 'Inactive'}.`);
    loadData();
  };

  const handleToggleFeatured = async (product: Product) => {
    await productService.updateProduct(product.id, { isFeatured: !product.isFeatured });
    showNotice(`Updated featured status for "${product.name}".`);
    loadData();
  };

  const handleToggleTrending = async (product: Product) => {
    await productService.updateProduct(product.id, { isTrending: !product.isTrending });
    showNotice(`Updated trending status for "${product.name}".`);
    loadData();
  };

  const handleDuplicate = async (product: Product) => {
    await productService.duplicateProduct(product.id);
    showNotice(`Duplicated "${product.name}" as draft.`);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;
    await productService.deleteProduct(deleteModalProduct.id);
    showNotice(`Deleted "${deleteModalProduct.name}".`);
    setDeleteModalProduct(null);
    loadData();
  };

  const filtered = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    if (platformFilter !== 'all' && p.affiliatePlatform.toLowerCase() !== platformFilter.toLowerCase()) return false;
    return true;
  });

  const platforms = Array.from(new Set(products.map((p) => p.affiliatePlatform))).filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-[#1A1816] text-[#FAF8F5] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-[#3E3832] animate-fade-in">
          {actionNotice}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Products Directory
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Total {products.length} products ({products.filter((p) => p.isActive).length} active on live site)
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#E8E2D7] rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product title or slug..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-lg text-xs text-[#1A1816] placeholder-[#A69B91] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-lg text-xs font-medium text-[#1A1816] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-lg text-xs font-medium text-[#1A1816] focus:outline-none"
          >
            <option value="all">All Retailers</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8C7E74] uppercase tracking-wider font-semibold border-b border-[#E8E2D7]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retailer</th>
                <th className="py-3 px-4">Store Price</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-center">Trending</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8C7E74]">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((prod) => {
                  const mainImage = prod.images.find((i) => i.isMain)?.publicUrl || prod.images[0]?.publicUrl;
                  const cat = categories.find((c) => c.id === prod.categoryId);

                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E8E2D7] shrink-0">
                            <ImageWithFallback
                              src={mainImage}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              fallbackText={prod.name}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-semibold text-[#1A1816] truncate">
                              {prod.name}
                            </h4>
                            <p className="font-mono text-[10px] text-[#8C7E74] truncate">
                              /{prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-[#5A5047] whitespace-nowrap">
                        {cat?.name || prod.categoryName || 'General Edit'}
                      </td>

                      {/* Retailer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#FAF5ED] font-mono text-[11px] font-semibold text-[#1A1816]">
                          {prod.affiliatePlatform}
                        </span>
                      </td>

                      {/* Store Price */}
                      <td className="py-3 px-4 font-mono font-bold text-[#1A1816] whitespace-nowrap">
                        {formatPrice(prod.currentPrice)}
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          title="Toggle featured status"
                          className={`p-1.5 rounded-lg transition-colors ${
                            prod.isFeatured
                              ? 'bg-[#1A1816] text-[#E4A853]'
                              : 'text-[#C5BCB2] hover:text-[#1A1816]'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Trending Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleTrending(prod)}
                          title="Toggle trending status"
                          className={`p-1.5 rounded-lg transition-colors ${
                            prod.isTrending
                              ? 'bg-[#F5F1E9] text-[#B87A44] border border-[#D8D2C6]'
                              : 'text-[#C5BCB2] hover:text-[#1A1816]'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            prod.isActive
                              ? 'bg-[#F0F7F2] text-[#2E7D44]'
                              : 'bg-[#F5F3EF] text-[#8C7E74]'
                          }`}
                        >
                          {prod.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            title="View public product page"
                            className="p-1.5 text-[#8C7E74] hover:text-[#1A1816] rounded-lg hover:bg-[#FAF8F5]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(prod)}
                            title="Duplicate product"
                            className="p-1.5 text-[#8C7E74] hover:text-[#1A1816] rounded-lg hover:bg-[#FAF8F5]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/products/edit/${prod.id}`}
                            title="Edit product"
                            className="p-1.5 text-[#8C7E74] hover:text-[#1A1816] rounded-lg hover:bg-[#FAF8F5]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeleteModalProduct(prod)}
                            title="Delete product"
                            className="p-1.5 text-[#8C7E74] hover:text-[#8E3B29] rounded-lg hover:bg-[#FAF0ED]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7A6E65]">
                    No products matched your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D7] space-y-4">
            <div className="flex items-center gap-3 text-[#8E3B29]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-bold text-[#1A1816]">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-xs text-[#5A5047] leading-relaxed">
              Are you sure you want to remove <strong>"{deleteModalProduct.name}"</strong>? This will permanently delete the item record and remove it from public discovery.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#5A5047] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#8E3B29] hover:bg-[#742E1F] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
