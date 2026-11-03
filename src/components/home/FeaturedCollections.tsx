import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shirt, Sparkle, Laptop, Home, Coins, Flame } from 'lucide-react';
import { Category } from '../../types';

interface FeaturedCollectionsProps {
  categories: Category[];
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ categories }) => {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'fashion-accessories':
        return <Shirt className="w-5 h-5" />;
      case 'grooming-skincare':
        return <Sparkle className="w-5 h-5" />;
      case 'tech-gadgets':
        return <Laptop className="w-5 h-5" />;
      case 'lifestyle':
        return <Home className="w-5 h-5" />;
      case 'budget-finds':
        return <Coins className="w-5 h-5" />;
      case 'trending-deals':
        return <Flame className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-16 md:py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              Curated Classifications
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] mt-1">
              Featured Collections
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1816] hover:text-[#8E3B29] transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group p-5 bg-white border border-[#EBE6DE] rounded-xl hover:border-[#1A1816] transition-all duration-300 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F5F1E9] text-[#1A1816] flex items-center justify-center mb-4 group-hover:bg-[#1A1816] group-hover:text-white transition-colors">
                {getIcon(cat.slug)}
              </div>

              <div>
                <h3 className="font-serif text-base font-semibold text-[#1A1816] group-hover:text-[#8E3B29] transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#8C7E74] mt-1">
                  Explore collection
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
