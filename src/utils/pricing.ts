/**
 * Pure utility functions for pricing, slugs, and filtering
 * Decoupled from UI for fast unit testing and strict correctness.
 */

export interface FilterableProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  affiliatePlatform: string;
  currentPrice: number | null;
  originalPrice: number | null;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ProductFilterOptions {
  searchQuery?: string;
  categoryId?: string;
  affiliatePlatform?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
}

/**
 * Calculates discount percentage strictly when both current and original prices
 * are valid positive numbers and originalPrice is strictly greater than currentPrice.
 * Returns null otherwise. Never invents fake discounts.
 */
export function calculateDiscount(
  currentPrice: number | null | undefined,
  originalPrice: number | null | undefined
): number | null {
  if (
    currentPrice == null ||
    originalPrice == null ||
    currentPrice <= 0 ||
    originalPrice <= 0 ||
    originalPrice <= currentPrice
  ) {
    return null;
  }
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return discount > 0 ? discount : null;
}

/**
 * Formats a numeric price into a refined currency string (USD by default or specified symbol).
 */
export function formatPrice(price: number | null | undefined, currency: string = '$'): string {
  if (price == null || isNaN(price) || price < 0) {
    return 'Price on Store';
  }
  return `${currency}${price.toLocaleString('en-US', {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts a product or category name to an SEO-friendly URL slug.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates whether an affiliate link is a well-formed HTTP/HTTPS URL.
 */
export function validateAffiliateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts the referrer domain for affiliate click logging.
 */
export function extractReferrerDomain(referrer: string | undefined): string | null {
  if (!referrer || typeof referrer !== 'string') return null;
  try {
    const parsed = new URL(referrer);
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Filters and sorts products efficiently based on user criteria.
 */
export function filterProducts<T extends FilterableProduct>(
  products: T[],
  filters: ProductFilterOptions
): T[] {
  return products.filter((p) => {
    if (!p.isActive) return false;

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      if (!matchName && !matchSlug) return false;
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      if (p.categoryId !== filters.categoryId) return false;
    }

    if (filters.affiliatePlatform && filters.affiliatePlatform !== 'all') {
      if (p.affiliatePlatform.toLowerCase() !== filters.affiliatePlatform.toLowerCase()) {
        return false;
      }
    }

    if (filters.isFeatured && !p.isFeatured) {
      return false;
    }

    if (filters.isTrending && !p.isTrending) {
      return false;
    }

    if (filters.minPrice != null && filters.minPrice > 0) {
      if (p.currentPrice == null || p.currentPrice < filters.minPrice) return false;
    }

    if (filters.maxPrice != null && filters.maxPrice > 0) {
      if (p.currentPrice != null && p.currentPrice > filters.maxPrice) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity);
      case 'price-desc':
        return (b.currentPrice ?? -Infinity) - (a.currentPrice ?? -Infinity);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}
