import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, clearWishlist } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ onlyActive: true }).then((all) => {
      const saved = all.filter((p) => wishlistIds.includes(p.id));
      setProducts(saved);
      setLoading(false);
    });
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-[#E8E2D7] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              <Heart className="w-3.5 h-3.5 text-[#E4A853] fill-current" />
              <span>Personal Style Archive</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1816] mt-1">
              Saved Wishlist
            </h1>
            <p className="text-sm text-[#7A6E65] mt-2">
              Items saved for future reference. Persisted in your browser without requiring an account.
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#8E3B29] hover:bg-[#FAF0ED] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D7] rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#FAF5ED] text-[#B87A44] flex items-center justify-center mx-auto mb-4 border border-[#E8DFC9]">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1816] mb-2">
              Your wishlist is currently empty
            </h3>
            <p className="text-sm text-[#7A6E65] mb-6 leading-relaxed">
              Discover iconic cashmere tailoring, artisanal fragrances, and audio objects across our edits and tap the heart icon on any card to save.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622] transition-colors"
            >
              <span>Explore Curations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
