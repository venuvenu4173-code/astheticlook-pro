import { Product, ProductImage } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS } from '../data/seedData';
import { generateSlug } from '../utils/pricing';

const LOCAL_STORAGE_KEY = 'aesthetic_look_products';

function checkOwnerAuthorized(): void {
  const sessionActive = localStorage.getItem('aesthetic_look_owner_session') === 'true';
  const email = (localStorage.getItem('aesthetic_look_owner_email') || '').toLowerCase();
  if (!sessionActive || email !== 'ashokboya4173@gmail.com') {
    throw new Error('Unauthorized: Only verified owner (ashokboya4173@gmail.com) can manage catalog products.');
  }
}

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const productService = {
  async getProducts(options?: {
    onlyActive?: boolean;
    featured?: boolean;
    trending?: boolean;
    categoryId?: string;
  }): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            images:product_images(*)
          `)
          .order('created_at', { ascending: false });

        if (options?.onlyActive !== false) {
          query = query.eq('is_active', true);
        }
        if (options?.featured) {
          query = query.eq('is_featured', true);
        }
        if (options?.trending) {
          query = query.eq('is_trending', true);
        }
        if (options?.categoryId && options.categoryId !== 'all') {
          query = query.eq('category_id', options.categoryId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            shortDescription: item.short_description || '',
            description: item.description || '',
            categoryId: item.category_id,
            affiliatePlatform: item.affiliate_platform,
            affiliateUrl: item.affiliate_url,
            currentPrice: item.current_price != null ? Number(item.current_price) : null,
            originalPrice: item.original_price != null ? Number(item.original_price) : null,
            isFeatured: Boolean(item.is_featured),
            isTrending: Boolean(item.is_trending),
            isActive: Boolean(item.is_active),
            images: (item.images || []).map((img: any) => ({
              id: img.id,
              productId: img.product_id,
              storagePath: img.storage_path,
              publicUrl: img.public_url,
              altText: img.alt_text,
              isMain: Boolean(img.is_main),
              displayOrder: Number(img.display_order || 0),
            })).sort((a: ProductImage, b: ProductImage) => a.displayOrder - b.displayOrder),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase query error, falling back to local dataset:', err);
      }
    }

    // Local fallback
    let list = getLocalProducts();
    if (options?.onlyActive !== false) {
      list = list.filter((p) => p.isActive);
    }
    if (options?.featured) {
      list = list.filter((p) => p.isFeatured);
    }
    if (options?.trending) {
      list = list.filter((p) => p.isTrending);
    }
    if (options?.categoryId && options.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === options.categoryId);
    }
    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(*)
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            shortDescription: data.short_description || '',
            description: data.description || '',
            categoryId: data.category_id,
            affiliatePlatform: data.affiliate_platform,
            affiliateUrl: data.affiliate_url,
            currentPrice: data.current_price != null ? Number(data.current_price) : null,
            originalPrice: data.original_price != null ? Number(data.original_price) : null,
            isFeatured: Boolean(data.is_featured),
            isTrending: Boolean(data.is_trending),
            isActive: Boolean(data.is_active),
            images: (data.images || []).map((img: any) => ({
              id: img.id,
              productId: img.product_id,
              storagePath: img.storage_path,
              publicUrl: img.public_url,
              altText: img.alt_text,
              isMain: Boolean(img.is_main),
              displayOrder: Number(img.display_order || 0),
            })).sort((a: ProductImage, b: ProductImage) => a.displayOrder - b.displayOrder),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getProductBySlug error:', err);
      }
    }

    const localList = getLocalProducts();
    return localList.find((p) => p.slug === slug) || null;
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    checkOwnerAuthorized();
    const slug = productData.slug || generateSlug(productData.name);

    if (isSupabaseConfigured && supabase) {
      const { data: productRow, error: productError } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          slug,
          short_description: productData.shortDescription,
          description: productData.description,
          category_id: productData.categoryId,
          affiliate_platform: productData.affiliatePlatform,
          affiliate_url: productData.affiliateUrl,
          current_price: productData.currentPrice,
          original_price: productData.originalPrice,
          is_featured: productData.isFeatured,
          is_trending: productData.isTrending,
          is_active: productData.isActive,
        })
        .select()
        .single();

      if (productError) {
        throw new Error(productError.message);
      }

      // Insert product images if any
      if (productData.images && productData.images.length > 0) {
        const imageRows = productData.images.map((img, idx) => ({
          product_id: productRow.id,
          storage_path: img.storagePath,
          public_url: img.publicUrl,
          alt_text: img.altText || productData.name,
          is_main: img.isMain ?? (idx === 0),
          display_order: idx + 1,
        }));

        await supabase.from('product_images').insert(imageRows);
      }

      return (await this.getProductBySlug(slug))!;
    }

    // Local save
    const newProduct: Product = {
      ...productData,
      id: `prod-local-${Date.now()}`,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = getLocalProducts();
    list.unshift(newProduct);
    saveLocalProducts(list);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    checkOwnerAuthorized();
    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, any> = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.slug !== undefined) updatePayload.slug = updates.slug;
      if (updates.shortDescription !== undefined) updatePayload.short_description = updates.shortDescription;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.categoryId !== undefined) updatePayload.category_id = updates.categoryId;
      if (updates.affiliatePlatform !== undefined) updatePayload.affiliate_platform = updates.affiliatePlatform;
      if (updates.affiliateUrl !== undefined) updatePayload.affiliate_url = updates.affiliateUrl;
      if (updates.currentPrice !== undefined) updatePayload.current_price = updates.currentPrice;
      if (updates.originalPrice !== undefined) updatePayload.original_price = updates.originalPrice;
      if (updates.isFeatured !== undefined) updatePayload.is_featured = updates.isFeatured;
      if (updates.isTrending !== undefined) updatePayload.is_trending = updates.isTrending;
      if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Handle images update if provided
      if (updates.images) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (updates.images.length > 0) {
          const imageRows = updates.images.map((img, idx) => ({
            product_id: id,
            storage_path: img.storagePath,
            public_url: img.publicUrl,
            alt_text: img.altText || updates.name,
            is_main: img.isMain ?? (idx === 0),
            display_order: idx + 1,
          }));
          await supabase.from('product_images').insert(imageRows);
        }
      }

      return (await this.getProductBySlug(data.slug))!;
    }

    const list = getLocalProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    saveLocalProducts(list);
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    checkOwnerAuthorized();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const list = getLocalProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  },

  async duplicateProduct(id: string): Promise<Product> {
    const list = getLocalProducts();
    const source = list.find((p) => p.id === id);
    if (!source) throw new Error('Product not found');

    const copyData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...source,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      isFeatured: false,
      isTrending: false,
      isActive: false, // Start as draft/inactive
      images: source.images.map((img) => ({
        ...img,
        id: `img-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
    };

    return this.createProduct(copyData);
  },
};
