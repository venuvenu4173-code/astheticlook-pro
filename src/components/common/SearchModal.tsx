import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { formatPrice } from '../../utils/pricing';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      productService.getProducts({ onlyActive: true }).then(setAllProducts);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const filtered = query.trim().length > 0
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query.toLowerCase())) ||
        p.affiliatePlatform.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectProduct = (slug: string) => {
    setSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleViewAllResults = () => {
    setSearchOpen(false);
    navigate(`/explore?search=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E8E2D7]">
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-[#E8E2D7]">
          <Search className="w-5 h-5 text-[#8C7E74] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleViewAllResults();
              }
            }}
            placeholder="Search luxury fashion, grooming, tech, lifestyle..."
            className="w-full px-4 text-base bg-transparent text-[#1A1816] placeholder-[#A69B91] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8C7E74] hover:text-[#1A1816] rounded-full mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-xs font-mono uppercase tracking-wider text-[#8C7E74] hover:text-[#1A1816] px-2 py-1 bg-[#F5F1E9] rounded"
          >
            ESC
          </button>
        </div>

        {/* Quick suggestions / trending tags */}
        {query.trim().length === 0 && (
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold mb-3">
              Suggested Explorations
            </p>
            <div className="flex flex-wrap gap-2">
              {['Cashmere Overcoat', 'Squalane Serum', 'Matte Black Headphones', 'Ceramic Vase', 'Japanese Canvas'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 text-xs font-medium text-[#5A5047] bg-[#F7F4EE] hover:bg-[#EAE4D9] rounded-lg transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Search Results */}
        {query.trim().length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#F2ECE4]">
            {filtered.length > 0 ? (
              <>
                <div className="p-2">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectProduct(item.slug)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#F5F1E9] overflow-hidden shrink-0 border border-[#E8E2D7]">
                        <img
                          src={item.images[0]?.publicUrl || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#8C7E74]">
                          <span>{item.categoryName || 'Edit'}</span>
                          <span>·</span>
                          <span>{item.affiliatePlatform}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#1A1816] truncate group-hover:text-[#8E3B29] transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-bold text-[#1A1816]">
                          {formatPrice(item.currentPrice)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#FAF8F5] text-center border-t border-[#E8E2D7]">
                  <button
                    onClick={handleViewAllResults}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#1A1816] hover:text-[#8E3B29]"
                  >
                    <span>View all matching results in catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-[#7A6E65]">
                <p>No products found matching "{query}".</p>
                <p className="text-xs text-[#A69B91] mt-1">
                  Try searching for materials like "wool", "leather", or categories like "grooming".
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
