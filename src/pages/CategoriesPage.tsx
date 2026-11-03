import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { Category, Product } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(true),
      productService.getProducts({ onlyActive: true }),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  const getCategoryDetails = (slug: string) => {
    switch (slug) {
      case 'fashion-accessories':
        return {
          desc: 'Architectural overcoats, fine Italian leather goods, and heirloom gold jewelry curated for longevity.',
          sampleImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
        };
      case 'grooming-skincare':
        return {
          desc: 'Clean restorative serums, cold-pressed squalane, and evocative niche botanical perfumery.',
          sampleImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
        };
      case 'tech-gadgets':
        return {
          desc: 'Precision studio audio, Grade 5 titanium horology, and sculptural wireless charging plinths.',
          sampleImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
        };
      case 'lifestyle':
        return {
          desc: 'Wheel-thrown unglazed ceramics, tactile organic linen, and small-batch scented wax tumblers.',
          sampleImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
        };
      case 'budget-finds':
        return {
          desc: 'High-density French terry cotton, heavyweight Japanese duck canvas, and verified daily essentials under $100.',
          sampleImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
        };
      case 'trending-deals':
        return {
          desc: 'Time-sensitive retail discounts on coveted archival acetate eyewear and design objects.',
          sampleImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
        };
      default:
        return {
          desc: 'Curated products aligned with the Aesthetic Look modern luxury design philosophy.',
          sampleImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 pb-6 border-b border-[#E8E2D7]">
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Taxonomy & Structure
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1816] mt-1">
            Curated Categories
          </h1>
          <p className="text-sm text-[#7A6E65] mt-2 max-w-xl">
            Explore curated design spheres organized by lifestyle context and materiality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const meta = getCategoryDetails(cat.slug);

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group bg-white border border-[#E8E2D7] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] bg-[#F5F1E9] overflow-hidden">
                  <img
                    src={meta.sampleImage}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-mono tracking-wider font-semibold">
                      {count} {count === 1 ? 'Curated Item' : 'Curated Items'}
                    </span>
                    <span className="text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#1A1816] group-hover:text-[#8E3B29] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#7A6E65] leading-relaxed mt-2">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F2ECE4] flex items-center justify-between text-xs text-[#8C7E74]">
                    <span>Curated daily</span>
                    <span className="font-medium text-[#1A1816] group-hover:underline">
                      View Collection &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
