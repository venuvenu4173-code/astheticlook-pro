import React, { useEffect, useState } from 'react';
import { Hero } from '../components/home/Hero';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { TrendingSection } from '../components/home/TrendingSection';
import { EditorsPicks } from '../components/home/EditorsPicks';
import { BudgetFinds } from '../components/home/BudgetFinds';
import { RecentlyAdded } from '../components/home/RecentlyAdded';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      productService.getProducts({ onlyActive: true }),
      categoryService.getCategories(true),
    ]).then(([prods, cats]) => {
      if (mounted) {
        setProducts(prods);
        setCategories(cats);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedCollections categories={categories} />
      <TrendingSection products={products} />
      <EditorsPicks products={products} />
      <BudgetFinds products={products} />
      <RecentlyAdded products={products} />
    </div>
  );
};
