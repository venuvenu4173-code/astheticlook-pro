import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Eye, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import { calculateDiscount, formatPrice } from '../../utils/pricing';
import { clickService } from '../../services/clickService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isInCompare,
    addToCompare,
    removeFromCompare,
    setQuickViewProduct,
  } = useApp();

  const isSaved = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const mainImage =
    product.images.find((img) => img.isMain)?.publicUrl ||
    product.images[0]?.publicUrl ||
    '';

  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleStoreClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Record affiliate click
    await clickService.recordClick({
      productId: product.id,
      productName: product.name,
      affiliatePlatform: product.affiliatePlatform,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#EBE6DE] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-[4/5] bg-[#F7F4EE] overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <ImageWithFallback
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackText={product.name}
          />
        </Link>

        {/* Badges Overlay (Quiet and elegant) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isFeatured && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#1A1816]/90 text-white rounded backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#E4A853]" />
              Featured
            </span>
          )}
          {product.isTrending && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#FAF8F5]/90 text-[#1A1816] rounded border border-[#E0D8CC] backdrop-blur-sm shadow-sm flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-[#B87A44]" />
              Trending
            </span>
          )}
        </div>

        {/* Quick Action Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-90 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-[#1A1816] text-[#E4A853]'
                : 'bg-white/80 hover:bg-white text-[#5A5047] hover:text-[#1A1816] shadow-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCompareToggle}
            aria-label={isCompared ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isCompared
                ? 'bg-[#1A1816] text-white'
                : 'bg-white/80 hover:bg-white text-[#5A5047] hover:text-[#1A1816] shadow-sm'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-[#5A5047] hover:text-[#1A1816] shadow-sm backdrop-blur-md transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Affiliate Platform Ribbon */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-black/60 text-white rounded backdrop-blur-sm">
            Available on {product.affiliatePlatform}
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Status */}
        <div className="flex items-center justify-between text-xs text-[#8C7E74] mb-1.5">
          <span className="uppercase tracking-widest text-[10px] font-medium truncate">
            {product.categoryName || 'Luxury Edit'}
          </span>
          {discount && (
            <span className="font-mono text-[11px] font-semibold text-[#8E3B29]">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-base font-semibold text-[#1A1816] leading-snug line-clamp-1 mb-1.5 group-hover:text-[#8E3B29] transition-colors">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Short description */}
        <p className="text-xs text-[#7A6E65] line-clamp-2 leading-relaxed mb-3">
          {product.shortDescription}
        </p>

        {/* Price and CTA Area (Pushed to bottom) */}
        <div className="mt-auto pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2">
          {/* Prices */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-[#1A1816]">
              {formatPrice(product.currentPrice)}
            </span>
            {product.originalPrice && product.originalPrice > (product.currentPrice || 0) && (
              <span className="font-mono text-xs text-[#A69B91] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Outbound Affiliate Link Action */}
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStoreClick}
            aria-label={`Visit store for ${product.name} on ${product.affiliatePlatform}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1A1816] bg-[#F5F1E9] hover:bg-[#1A1816] hover:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <span>Visit Store</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
