import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

interface BudgetFindsProps {
  products: Product[];
}

export const BudgetFinds: React.FC<BudgetFindsProps> = ({ products }) => {
  // Verified under $100 items or budget-finds category
  const budgetItems = products
    .filter((p) => p.categoryId === 'cat-budget' || (p.currentPrice != null && p.currentPrice <= 85))
    .slice(0, 4);

  if (budgetItems.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-white border-t border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#5A5047] font-semibold">
              <Coins className="w-3.5 h-3.5 text-[#B87A44]" />
              <span>Attainable Luxury</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] mt-1">
              Budget Luxury Finds
            </h2>
            <p className="text-xs text-[#7A6E65] mt-1">
              Verified items under $100 with uncompromising craftsmanship and elevated design.
            </p>
          </div>
          <Link
            to="/category/budget-finds"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1816] hover:text-[#8E3B29] transition-colors"
          >
            <span>Explore All Budget Finds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
