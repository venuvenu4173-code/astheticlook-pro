import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Heart, Scale, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import { calculateDiscount, formatPrice } from '../../utils/pricing';
import { clickService } from '../../services/clickService';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, isInWishlist, addToWishlist, removeFromWishlist, isInCompare, addToCompare, removeFromCompare } = useApp();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [quickViewProduct]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isSaved = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  const images = product.images.length > 0 ? product.images : [
    { id: 'fallback', storagePath: '', publicUrl: '', isMain: true, displayOrder: 1 }
  ];

  const currentImage = images[selectedImageIdx] || images[0];

  const handleStoreClick = async () => {
    await clickService.recordClick({
      productId: product.id,
      productName: product.name,
      affiliatePlatform: product.affiliatePlatform,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#1A1816] shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="w-full md:w-1/2 bg-[#F7F4EE] p-6 flex flex-col justify-between">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[#EBE6DE]">
            <ImageWithFallback
              src={currentImage.publicUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              fallbackText={product.name}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIdx === idx ? 'border-[#1A1816]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={img.publicUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          {/* Category & Verified Discount */}
          <div className="flex items-center justify-between text-xs text-[#8C7E74] mb-2">
            <span className="uppercase tracking-widest font-semibold">{product.categoryName || 'Luxury Edit'}</span>
            <span className="px-2 py-0.5 rounded bg-[#FAF5ED] text-[#8E3B29] font-mono font-medium">
              Verified {product.affiliatePlatform} Partner
            </span>
          </div>

          {/* Title */}
          <h2 id="quick-view-title" className="font-serif text-2xl md:text-3xl font-bold text-[#1A1816] mb-3">
            {product.name}
          </h2>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-2xl font-bold text-[#1A1816]">
              {formatPrice(product.currentPrice)}
            </span>
            {product.originalPrice && product.originalPrice > (product.currentPrice || 0) && (
              <span className="font-mono text-base text-[#A69B91] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount && (
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-[#8E3B29] text-white rounded">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-[#5A5047] leading-relaxed space-y-3 mb-6">
            <p>{product.description || product.shortDescription}</p>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3 pt-4 border-t border-[#F2ECE4]">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleStoreClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <span>Visit Official Store on {product.affiliatePlatform}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex gap-2">
              <button
                onClick={() => isSaved ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  isSaved
                    ? 'border-[#1A1816] bg-[#1A1816] text-[#E4A853]'
                    : 'border-[#D8D2C6] bg-white hover:bg-[#FAF8F5] text-[#1A1816]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => isCompared ? removeFromCompare(product.id) : addToCompare(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  isCompared
                    ? 'border-[#1A1816] bg-[#1A1816] text-white'
                    : 'border-[#D8D2C6] bg-white hover:bg-[#FAF8F5] text-[#1A1816]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#A69B91] text-center pt-1 leading-snug">
              Direct checkout is handled securely on retailer's verified site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
