import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

interface TrendingSectionProps {
  products: Product[];
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ products }) => {
  const trendingItems = products.filter((p) => p.isTrending).slice(0, 4);

  if (trendingItems.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-white border-y border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#B87A44] font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>High Engagement Signals</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] mt-1">
              Trending Now
            </h2>
          </div>
          <Link
            to="/explore?filter=trending"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1816] hover:text-[#8E3B29] transition-colors"
          >
            <span>View All Trending ({products.filter((p) => p.isTrending).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
