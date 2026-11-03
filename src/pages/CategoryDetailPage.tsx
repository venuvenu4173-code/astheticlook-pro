import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      categoryService.getCategories(false),
      productService.getProducts({ onlyActive: true }),
    ]).then(([cats, prods]) => {
      if (!mounted) return;
      const matched = cats.find((c) => c.slug === slug);
      setCategory(matched || null);
      if (matched) {
        setProducts(prods.filter((p) => p.categoryId === matched.id));
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity);
    }
    if (sortBy === 'price-desc') {
      return (b.currentPrice ?? -Infinity) - (a.currentPrice ?? -Infinity);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7E74] hover:text-[#1A1816] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Categories</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-8 pb-6 border-b border-[#E8E2D7] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              Category Curation
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1816] mt-1">
              {category ? category.name : 'Curated Edit'}
            </h1>
            <p className="text-sm text-[#7A6E65] mt-2">
              Showing {sortedProducts.length} verified affiliate product selections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7E74] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#1A1816] focus:outline-none"
            >
              <option value="newest">Latest Curations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-[#E8E2D7] rounded-xl p-4 animate-pulse">
                <div className="aspect-[4/5] bg-[#F0EAE1] rounded-lg mb-4" />
                <div className="h-4 bg-[#F0EAE1] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#F0EAE1] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D7] rounded-2xl p-12 text-center">
            <h3 className="font-serif text-2xl font-bold text-[#1A1816] mb-2">
              No products found in this category yet
            </h3>
            <p className="text-sm text-[#7A6E65] max-w-md mx-auto mb-6">
              Our editors are currently selecting new items for this collection.
            </p>
            <Link
              to="/explore"
              className="px-5 py-2.5 bg-[#1A1816] text-white text-xs font-semibold rounded-lg hover:bg-[#2C2622]"
            >
              Explore Other Edits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
