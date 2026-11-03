import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Search, RefreshCw } from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '../types';
import { filterProducts } from '../utils/pricing';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get('filter') === 'featured');
  const [isTrendingOnly, setIsTrendingOnly] = useState(searchParams.get('filter') === 'trending');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ onlyActive: true }),
      categoryService.getCategories(true),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  // Sync url search parameters if they change
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearchQuery(urlSearch);

    const urlCat = searchParams.get('category');
    if (urlCat) setSelectedCategory(urlCat);

    const filterType = searchParams.get('filter');
    if (filterType === 'trending') setIsTrendingOnly(true);
    if (filterType === 'featured') setIsFeaturedOnly(true);
  }, [searchParams]);

  const filteredProducts = filterProducts(products, {
    searchQuery,
    categoryId: selectedCategory,
    affiliatePlatform: selectedPlatform,
    maxPrice,
    isFeatured: isFeaturedOnly,
    isTrending: isTrendingOnly,
    sortBy,
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPlatform('all');
    setMaxPrice(600);
    setIsFeaturedOnly(false);
    setIsTrendingOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const platforms = Array.from(new Set(products.map((p) => p.affiliatePlatform))).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-[#E8E2D7]">
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Catalog & Editorial Edits
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1816] mt-1">
            Explore All Curations
          </h1>
          <p className="text-sm text-[#7A6E65] mt-2 max-w-2xl">
            Filter by authentic affiliate platforms, verified pricing, curated collections, and seasonal style movements.
          </p>
        </div>

        {/* Toolbar: Search input + mobile filter button + sort dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C7E74] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, fabric, or design..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] placeholder-[#A69B91] focus:outline-none focus:border-[#1A1816]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C7E74] hover:text-[#1A1816]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#1A1816]"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-[#8C7E74] font-medium whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 bg-white border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#1A1816] focus:outline-none"
              >
                <option value="newest">Latest Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Filter Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white border border-[#E8E2D7] rounded-xl p-5 space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <h3 className="font-serif text-lg font-bold text-[#1A1816]">Refine Discovery</h3>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#8E3B29] hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Status Toggles */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8C7E74] font-semibold block mb-2">
                  Highlight Flags
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#1A1816] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeaturedOnly}
                    onChange={(e) => setIsFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D8D2C6] text-[#1A1816] focus:ring-0"
                  />
                  <span>Featured Editor's Picks</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#1A1816] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrendingOnly}
                    onChange={(e) => setIsTrendingOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D8D2C6] text-[#1A1816] focus:ring-0"
                  />
                  <span>Trending Right Now</span>
                </label>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-[#8C7E74] font-semibold block mb-2">
                  Category
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-[#1A1816] text-white font-medium'
                        : 'text-[#5A5047] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span>All Collections</span>
                    <span>{products.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-[#1A1816] text-white font-medium'
                            : 'text-[#5A5047] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="ml-2 font-mono text-[11px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-[#8C7E74] font-semibold block mb-2">
                  Affiliate Retailer
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                      selectedPlatform === 'all'
                        ? 'bg-[#1A1816] text-white font-medium'
                        : 'text-[#5A5047] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span>All Retailers</span>
                  </button>
                  {platforms.map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setSelectedPlatform(plat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                        selectedPlatform.toLowerCase() === plat.toLowerCase()
                          ? 'bg-[#1A1816] text-white font-medium'
                          : 'text-[#5A5047] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{plat}</span>
                      <span className="font-mono text-[11px] opacity-75">
                        {products.filter((p) => p.affiliatePlatform.toLowerCase() === plat.toLowerCase()).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label className="uppercase tracking-wider text-[#8C7E74] font-semibold">
                    Max Price
                  </label>
                  <span className="font-mono font-bold text-[#1A1816]">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="600"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1A1816] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8C7E74] font-mono mt-1">
                  <span>$20</span>
                  <span>$600+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between text-xs text-[#8C7E74]">
              <span>
                Showing <strong className="text-[#1A1816] font-mono">{filteredProducts.length}</strong> verified items
              </span>
              {(selectedCategory !== 'all' || selectedPlatform !== 'all' || isFeaturedOnly || isTrendingOnly || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-[#8E3B29] hover:underline font-medium"
                >
                  Clear active filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-[#E8E2D7] rounded-xl p-4 animate-pulse">
                    <div className="aspect-[4/5] bg-[#F0EAE1] rounded-lg mb-4" />
                    <div className="h-4 bg-[#F0EAE1] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#F0EAE1] rounded w-1/2 mb-4" />
                    <div className="h-6 bg-[#F0EAE1] rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E8E2D7] rounded-2xl p-12 text-center">
                <SlidersHorizontal className="w-10 h-10 text-[#A69B91] mx-auto mb-3" />
                <h3 className="font-serif text-2xl font-bold text-[#1A1816] mb-2">
                  No products match your criteria
                </h3>
                <p className="text-sm text-[#7A6E65] max-w-md mx-auto mb-6">
                  Try adjusting the price slider, clearing specific tags, or broadening your search terms.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-[#1A1816] text-white text-xs font-semibold rounded-lg hover:bg-[#2C2622] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
