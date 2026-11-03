import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Heart,
  Scale,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Share2,
  ZoomIn,
  TrendingUp,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { productService } from '../services/productService';
import { clickService } from '../services/clickService';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDiscount, formatPrice } from '../utils/pricing';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isInCompare,
    addToCompare,
    removeFromCompare,
  } = useApp();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setSelectedImgIndex(0);

    if (slug) {
      productService.getProductBySlug(slug).then(async (prod) => {
        if (!mounted) return;
        if (!prod) {
          setProduct(null);
          setLoading(false);
          return;
        }

        setProduct(prod);

        // Fetch related products
        const all = await productService.getProducts({ onlyActive: true });
        const related = all.filter((p) => p.categoryId === prod.categoryId && p.id !== prod.id).slice(0, 4);
        setRelatedProducts(related);

        // Update recently viewed in localStorage
        try {
          const stored = localStorage.getItem('aesthetic_look_recently_viewed');
          let parsed: string[] = stored ? JSON.parse(stored) : [];
          parsed = [prod.id, ...parsed.filter((id) => id !== prod.id)].slice(0, 6);
          localStorage.setItem('aesthetic_look_recently_viewed', JSON.stringify(parsed));

          const recentItems = all.filter((p) => parsed.includes(p.id) && p.id !== prod.id).slice(0, 4);
          setRecentlyViewed(recentItems);
        } catch {}

        setLoading(false);
      });
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#1A1816] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#8C7E74] font-medium font-mono">
            Loading editorial curation...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mb-4">
            Curated Product Not Found
          </h1>
          <p className="text-sm text-[#7A6E65] mb-8">
            The item you are looking for may have been archived or moved to a different seasonal edit.
          </p>
          <Link
            to="/explore"
            className="px-6 py-3 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622]"
          >
            Explore All Current Edits
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  const images = product.images.length > 0 ? product.images : [
    {
      id: 'default',
      storagePath: '',
      publicUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      isMain: true,
      displayOrder: 1,
    },
  ];

  const currentImage = images[selectedImgIndex] || images[0];

  const handleVisitStore = async () => {
    await clickService.recordClick({
      productId: product.id,
      productName: product.name,
      affiliatePlatform: product.affiliatePlatform,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C7E74] hover:text-[#1A1816] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Curations</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A5047] hover:text-[#1A1816] px-3 py-1.5 bg-white border border-[#D8D2C6] rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Edit'}</span>
          </button>
        </div>

        {/* Main Product Layout: Gallery Left + Sticky Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-white border border-[#E8E2D7] rounded-2xl overflow-hidden shadow-sm group">
              <ImageWithFallback
                src={currentImage.publicUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackText={product.name}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="px-3 py-1 text-xs uppercase tracking-wider font-semibold bg-[#1A1816] text-white rounded shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#E4A853]" />
                    Featured Edit
                  </span>
                )}
                {product.isTrending && (
                  <span className="px-3 py-1 text-xs uppercase tracking-wider font-semibold bg-white/95 text-[#1A1816] rounded border border-[#D8D2C6] shadow-sm flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-[#B87A44]" />
                    Trending Signal
                  </span>
                )}
              </div>

              {/* Zoom Trigger Button */}
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#1A1816] shadow-md backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id || index}
                    onClick={() => setSelectedImgIndex(index)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                      selectedImgIndex === index
                        ? 'border-[#1A1816] shadow-md'
                        : 'border-[#E8E2D7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={img.publicUrl}
                      alt={`${product.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sticky Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 lg:sticky lg:top-28 shadow-sm">
              {/* Category & Platform Lockup */}
              <div className="flex items-center justify-between text-xs text-[#8C7E74] pb-4 border-b border-[#F0EAE1]">
                <span className="uppercase tracking-widest font-semibold">
                  {product.categoryName || 'Luxury Essential'}
                </span>
                <span className="px-2.5 py-1 bg-[#FAF5ED] text-[#1A1816] rounded font-mono text-[11px] font-semibold">
                  {product.affiliatePlatform} Verified
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] leading-tight text-balance">
                  {product.name}
                </h1>
                <p className="text-xs text-[#7A6E65] mt-2 font-light">
                  {product.shortDescription}
                </p>
              </div>

              {/* Pricing & Verified Discounts */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE7DD] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C7E74] block mb-0.5">
                    Verified Store Price
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-3xl font-bold text-[#1A1816]">
                      {formatPrice(product.currentPrice)}
                    </span>
                    {product.originalPrice && product.originalPrice > (product.currentPrice || 0) && (
                      <span className="font-mono text-base text-[#A69B91] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discount && (
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#8E3B29] text-white rounded">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Primary Outbound Affiliate CTA */}
              <div className="space-y-3">
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleVisitStore}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#2C2622] rounded-xl text-sm font-semibold tracking-wide transition-colors shadow-md group"
                >
                  <span>Visit Store on {product.affiliatePlatform}</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                {/* Secondary Toggles: Wishlist & Compare */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => isSaved ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                      isSaved
                        ? 'border-[#1A1816] bg-[#1A1816] text-[#E4A853]'
                        : 'border-[#D8D2C6] bg-white hover:bg-[#FAF8F5] text-[#1A1816]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => isCompared ? removeFromCompare(product.id) : addToCompare(product.id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                      isCompared
                        ? 'border-[#1A1816] bg-[#1A1816] text-white'
                        : 'border-[#D8D2C6] bg-white hover:bg-[#FAF8F5] text-[#1A1816]'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    <span>{isCompared ? 'In Compare (View)' : 'Compare Product'}</span>
                  </button>
                </div>
              </div>

              {/* Retailer Guarantees (Adjacency trust) */}
              <div className="pt-4 border-t border-[#F0EAE1] space-y-2.5 text-xs text-[#7A6E65]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A7C59] shrink-0" />
                  <span>Verified external retailer partner listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4A7C59] shrink-0" />
                  <span>Secure checkout on official merchant domain</span>
                </div>
                <div className="flex items-start gap-2 pt-1 text-[11px] text-[#8C7E74]">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Affiliate Disclosure: We may earn a commission on qualifying purchases made through our curated links at zero extra cost to you.
                  </span>
                </div>
              </div>

              {/* Full Description & Material Details */}
              <div className="pt-4 border-t border-[#F0EAE1]">
                <h3 className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold mb-3">
                  Editorial Specification
                </h3>
                <div className="text-sm text-[#5A5047] leading-relaxed space-y-3 font-light">
                  <p>{product.description || product.shortDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E2D7]">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
                Harmonious Pairings
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1816] mt-1">
                Related Curations
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E8E2D7]">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
                Your Browsing History
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1816] mt-1">
                Recently Viewed
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 p-2 text-white bg-white/20 hover:bg-white/40 rounded-full transition-colors"
            aria-label="Close zoom"
          >
            ✕
          </button>
          <img
            src={currentImage.publicUrl}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
