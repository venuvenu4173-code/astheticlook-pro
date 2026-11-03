import { Category } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_CATEGORIES } from '../data/seedData';
import { generateSlug } from '../utils/pricing';

const LOCAL_STORAGE_KEY = 'aesthetic_look_categories';

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
      } catch (err) {
        console.warn('Supabase getCategories error, falling back to local:', err);
      }
    }

    const list = getLocalCategories();
    return onlyActive ? list.filter((c) => c.isActive) : list;
  },

  async createCategory(data: { name: string; slug?: string; imagePath?: string }): Promise<Category> {
    const slug = data.slug || generateSlug(data.name);

    if (isSupabaseConfigured && supabase) {
      const { data: row, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          slug,
          image_path: data.imagePath,
          is_active: true,
          display_order: 99,
        })
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
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
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
