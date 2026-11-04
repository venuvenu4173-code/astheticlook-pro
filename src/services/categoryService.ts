import { Category } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CATEGORIES } from '../data/seedData';
import { generateSlug } from '../utils/pricing';

const LOCAL_STORAGE_KEY = 'aesthetic_look_categories';

export const STANDARD_CATEGORIES = [
  { name: 'Fashion & Accessories', slug: 'fashion-accessories', displayOrder: 1 },
  { name: 'Grooming & Skincare', slug: 'grooming-skincare', displayOrder: 2 },
  { name: 'Tech Gadgets', slug: 'tech-gadgets', displayOrder: 3 },
  { name: 'Lifestyle', slug: 'lifestyle', displayOrder: 4 },
  { name: 'Budget Finds', slug: 'budget-finds', displayOrder: 5 },
  { name: 'Trending Deals', slug: 'trending-deals', displayOrder: 6 },
];

export const CATEGORY_SQL_SEED = `-- Curated Standard Categories Seed
INSERT INTO public.categories (name, slug, display_order, is_active)
VALUES
    ('Fashion & Accessories', 'fashion-accessories', 1, TRUE),
    ('Grooming & Skincare', 'grooming-skincare', 2, TRUE),
    ('Tech Gadgets', 'tech-gadgets', 3, TRUE),
    ('Lifestyle', 'lifestyle', 4, TRUE),
    ('Budget Finds', 'budget-finds', 5, TRUE),
    ('Trending Deals', 'trending-deals', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;`;

function checkOwnerAuthorized(): void {
  const sessionActive = localStorage.getItem('aesthetic_look_owner_session') === 'true';
  const email = (localStorage.getItem('aesthetic_look_owner_email') || '').toLowerCase();
  if (!sessionActive || email !== 'ashokboya4173@gmail.com') {
    throw new Error('Unauthorized: Only verified owner (ashokboya4173@gmail.com) can manage categories.');
  }
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(categories: Category[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
}

export const categoryService = {
  /**
   * Retrieves all categories from Supabase (or local fallback).
   */
  async getCategories(onlyActive = true): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (onlyActive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            imagePath: item.image_path,
            isActive: Boolean(item.is_active),
            displayOrder: Number(item.display_order || 0),
            createdAt: item.created_at,
          }));
        }

        if (error) {
          console.warn('Supabase getCategories error, checking fallback:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getCategories exception:', err);
      }
    }

    const list = getLocalCategories();
    return onlyActive ? list.filter((c) => c.isActive) : list;
  },

  getStandardPresetCategories(): Category[] {
    return STANDARD_CATEGORIES.map((cat) => ({
      id: `preset-${cat.slug}`,
      name: cat.name,
      slug: cat.slug,
      isActive: true,
      displayOrder: cat.displayOrder,
      productCount: 0,
    }));
  },

  /**
   * Initializes or updates the 6 required standard categories in Supabase without duplicates.
   */
  async ensureStandardCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = STANDARD_CATEGORIES.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          is_active: true,
          display_order: cat.displayOrder,
        }));

        const { data, error } = await supabase
          .from('categories')
          .upsert(rows, { onConflict: 'slug' })
          .select();

        if (error) {
          console.warn('Supabase RLS prevented direct category insert:', error.message);
          saveLocalCategories(INITIAL_CATEGORIES);
          if (error.code === '42501' || error.message.includes('row-level security')) {
            throw new Error(
              'Supabase Row-Level Security requires an authenticated owner session. Please sign in with your verified owner account (ashokboya4173@gmail.com) via Admin Login, or run the Category SQL Seed in your Supabase SQL Editor.'
            );
          }
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            imagePath: item.image_path,
            isActive: Boolean(item.is_active),
            displayOrder: Number(item.display_order || 0),
            createdAt: item.created_at,
          }));
        }

        return this.getCategories(false);
      } catch (err: any) {
        throw err;
      }
    }

    saveLocalCategories(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  },

  /**
   * Creates a new category ensuring no duplicate slugs.
   */
  async createCategory(data: { name: string; slug?: string; imagePath?: string }): Promise<Category> {
    checkOwnerAuthorized();
    const slug = data.slug || generateSlug(data.name);

    if (isSupabaseConfigured && supabase) {
      const { data: row, error } = await supabase
        .from('categories')
        .upsert(
          {
            name: data.name.trim(),
            slug,
            image_path: data.imagePath,
            is_active: true,
            display_order: 99,
          },
          { onConflict: 'slug' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        imagePath: row.image_path,
        isActive: Boolean(row.is_active),
        displayOrder: Number(row.display_order),
        createdAt: row.created_at,
      };
    }

    const list = getLocalCategories();
    // Prevent duplicate slugs
    const existing = list.find((c) => c.slug === slug);
    if (existing) return existing;

    const newCategory: Category = {
      id: `cat-local-${Date.now()}`,
      name: data.name,
      slug,
      imagePath: data.imagePath,
      isActive: true,
      displayOrder: list.length + 1,
      createdAt: new Date().toISOString(),
    };
    list.push(newCategory);
    saveLocalCategories(list);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    checkOwnerAuthorized();
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.imagePath !== undefined) payload.image_path = updates.imagePath;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        imagePath: data.image_path,
        isActive: Boolean(data.is_active),
        displayOrder: Number(data.display_order),
      };
    }

    const list = getLocalCategories();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveLocalCategories(list);
    return updated;
  },

  async deleteCategory(id: string): Promise<boolean> {
    checkOwnerAuthorized();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const list = getLocalCategories();
    const filtered = list.filter((c) => c.id !== id);
    saveLocalCategories(filtered);
    return true;
  },
};
