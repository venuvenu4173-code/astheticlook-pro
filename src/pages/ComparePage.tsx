import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Trash2, ArrowRight, ExternalLink, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { productService } from '../services/productService';
import { clickService } from '../services/clickService';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/pricing';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const ComparePage: React.FC = () => {
  const { compareIds, removeFromCompare, clearCompare } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ onlyActive: true }).then((all) => {
      const selected = all.filter((p) => compareIds.includes(p.id));
      setProducts(selected);
      setLoading(false);
    });
  }, [compareIds]);

  const handleVisitStore = async (p: Product) => {
    await clickService.recordClick({
      productId: p.id,
      productName: p.name,
      affiliatePlatform: p.affiliatePlatform,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-[#E8E2D7] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>Specification Analysis</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1816] mt-1">
              Product Comparison
            </h1>
            <p className="text-sm text-[#7A6E65] mt-2">
              Compare up to 3 curated products across verified pricing, affiliate retailers, and materiality.
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#8E3B29] hover:bg-[#FAF0ED] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Comparison</span>
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-[#E8E2D7] rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#FAF5ED] text-[#1A1816] flex items-center justify-center mx-auto mb-4 border border-[#E8DFC9]">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1816] mb-2">
              No products selected for comparison
            </h3>
            <p className="text-sm text-[#7A6E65] mb-6 leading-relaxed">
              Tap the compare icon on up to three product cards to view side-by-side materials, retailer availability, and pricing details.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622] transition-colors"
            >
              <span>Explore Curations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="min-w-[700px] bg-white border border-[#E8E2D7] rounded-2xl shadow-sm overflow-hidden">
              {/* Product Visual Header Grid */}
              <div
                className="grid divide-x divide-[#E8E2D7] border-b border-[#E8E2D7]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-6 bg-[#FAF8F5] flex flex-col justify-end">
                  <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
                    Product Detail
                  </span>
                  <span className="text-xs text-[#A69B91] mt-1">
                    {products.length} of 3 items compared
                  </span>
                </div>

                {products.map((p) => {
                  const mainImg = p.images.find((i) => i.isMain)?.publicUrl || p.images[0]?.publicUrl;
                  return (
                    <div key={p.id} className="p-6 relative flex flex-col justify-between">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F5F1E9] hover:bg-[#EAE4D9] text-[#7A6E65] hover:text-[#1A1816] transition-colors"
                        aria-label={`Remove ${p.name} from comparison`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D7] mb-4">
                        <ImageWithFallback
                          src={mainImg}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          fallbackText={p.name}
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#8C7E74] font-medium">
                          {p.categoryName || 'Curated Edit'}
                        </span>
                        <h4 className="font-serif text-lg font-bold text-[#1A1816] line-clamp-2 mt-0.5">
                          <Link to={`/product/${p.slug}`} className="hover:text-[#8E3B29]">
                            {p.name}
                          </Link>
                        </h4>
                      </div>

                      <div className="mt-4">
                        <a
                          href={p.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleVisitStore(p)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs font-semibold transition-colors"
                        >
                          <span>Visit {p.affiliatePlatform}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div
                className="grid divide-x divide-[#E8E2D7] border-b border-[#F0EAE1]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-4 bg-[#FAF8F5] font-semibold text-xs text-[#5A5047] uppercase tracking-wider">
                  Store Price
                </div>
                {products.map((p) => {
                  const discount = calculateDiscount(p.currentPrice, p.originalPrice);
                  return (
                    <div key={p.id} className="p-4 flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-[#1A1816]">
                        {formatPrice(p.currentPrice)}
                      </span>
                      {p.originalPrice && p.originalPrice > (p.currentPrice || 0) && (
                        <span className="font-mono text-xs text-[#A69B91] line-through">
                          {formatPrice(p.originalPrice)}
                        </span>
                      )}
                      {discount && (
                        <span className="font-mono text-xs font-semibold text-[#8E3B29]">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                className="grid divide-x divide-[#E8E2D7] border-b border-[#F0EAE1]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-4 bg-[#FAF8F5] font-semibold text-xs text-[#5A5047] uppercase tracking-wider">
                  Affiliate Retailer
                </div>
                {products.map((p) => (
                  <div key={p.id} className="p-4 text-xs font-medium text-[#1A1816]">
                    <span className="px-2 py-1 bg-[#FAF5ED] rounded font-mono">
                      {p.affiliatePlatform}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="grid divide-x divide-[#E8E2D7] border-b border-[#F0EAE1]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-4 bg-[#FAF8F5] font-semibold text-xs text-[#5A5047] uppercase tracking-wider">
                  Classification
                </div>
                {products.map((p) => (
                  <div key={p.id} className="p-4 text-xs text-[#5A5047]">
                    {p.categoryName || 'General Edit'}
                  </div>
                ))}
              </div>

              <div
                className="grid divide-x divide-[#E8E2D7] border-b border-[#F0EAE1]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-4 bg-[#FAF8F5] font-semibold text-xs text-[#5A5047] uppercase tracking-wider">
                  Highlight Flags
                </div>
                {products.map((p) => (
                  <div key={p.id} className="p-4 text-xs space-y-1">
                    {p.isFeatured && (
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#1A1816] text-white rounded mr-1">
                        Featured
                      </span>
                    )}
                    {p.isTrending && (
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#F5F1E9] text-[#1A1816] border border-[#DDD5C7] rounded">
                        Trending
                      </span>
                    )}
                    {!p.isFeatured && !p.isTrending && (
                      <span className="text-[#A69B91] text-xs">Standard catalog</span>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="grid divide-x divide-[#E8E2D7]"
                style={{ gridTemplateColumns: `200px repeat(${products.length}, minmax(0, 1fr))` }}
              >
                <div className="p-4 bg-[#FAF8F5] font-semibold text-xs text-[#5A5047] uppercase tracking-wider">
                  Editorial Specification
                </div>
                {products.map((p) => (
                  <div key={p.id} className="p-4 text-xs text-[#7A6E65] leading-relaxed font-light">
                    {p.description || p.shortDescription}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
