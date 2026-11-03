import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDiscount,
  formatPrice,
  generateSlug,
  validateAffiliateUrl,
  extractReferrerDomain,
  filterProducts,
  FilterableProduct,
} from './pricing';

test('calculateDiscount returns correct percentage only when both prices are valid and original > current', () => {
  assert.equal(calculateDiscount(80, 100), 20);
  assert.equal(calculateDiscount(75, 100), 25);
  assert.equal(calculateDiscount(149.99, 199.99), 25);
  assert.equal(calculateDiscount(100, 100), null);
  assert.equal(calculateDiscount(120, 100), null); // Price increased, no discount
  assert.equal(calculateDiscount(null, 100), null);
  assert.equal(calculateDiscount(80, null), null);
  assert.equal(calculateDiscount(0, 100), null);
  assert.equal(calculateDiscount(-10, 100), null);
});

test('formatPrice formats numbers and handles null or undefined properly', () => {
  assert.equal(formatPrice(120), '$120');
  assert.equal(formatPrice(129.5), '$129.50');
  assert.equal(formatPrice(1250), '$1,250');
  assert.equal(formatPrice(null), 'Price on Store');
  assert.equal(formatPrice(undefined), 'Price on Store');
});

test('generateSlug produces clean, url-safe slugs', () => {
  assert.equal(generateSlug('Tailored Cashmere Coat'), 'tailored-cashmere-coat');
  assert.equal(generateSlug('Hinoki & Bergamot Eau De Parfum!'), 'hinoki-bergamot-eau-de-parfum');
  assert.equal(generateSlug('   Multiple   Spaces---Here   '), 'multiple-spaces-here');
});

test('validateAffiliateUrl checks http and https protocols', () => {
  assert.equal(validateAffiliateUrl('https://amazon.com/dp/B08X?tag=asthetic-20'), true);
  assert.equal(validateAffiliateUrl('http://flipkart.com/item/123'), true);
  assert.equal(validateAffiliateUrl('javascript:alert(1)'), false);
  assert.equal(validateAffiliateUrl('not-a-url'), false);
  assert.equal(validateAffiliateUrl(''), false);
});

test('extractReferrerDomain extracts domain or returns null', () => {
  assert.equal(extractReferrerDomain('https://instagram.com/p/12345'), 'instagram.com');
  assert.equal(extractReferrerDomain('https://asthetic-look.pro/explore'), 'asthetic-look.pro');
  assert.equal(extractReferrerDomain('invalid-domain'), null);
  assert.equal(extractReferrerDomain(undefined), null);
});

test('filterProducts correctly filters by category, platform, query and active status', () => {
  const dummy: FilterableProduct[] = [
    {
      id: '1',
      name: 'Cashmere Blazer',
      slug: 'cashmere-blazer',
      categoryId: 'cat-fashion',
      affiliatePlatform: 'Amazon',
      currentPrice: 280,
      originalPrice: 350,
      isFeatured: true,
      isTrending: false,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Ceramic Pour Over',
      slug: 'ceramic-pour-over',
      categoryId: 'cat-lifestyle',
      affiliatePlatform: 'Flipkart',
      currentPrice: 45,
      originalPrice: 50,
      isFeatured: false,
      isTrending: true,
      isActive: true,
      createdAt: '2026-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'Draft Inactive Item',
      slug: 'draft-inactive-item',
      categoryId: 'cat-fashion',
      affiliatePlatform: 'Amazon',
      currentPrice: 100,
      originalPrice: null,
      isFeatured: false,
      isTrending: false,
      isActive: false, // Inactive
      createdAt: '2026-01-03T00:00:00Z',
    },
  ];

  const activeOnly = filterProducts(dummy, {});
  assert.equal(activeOnly.length, 2);

  const fashionOnly = filterProducts(dummy, { categoryId: 'cat-fashion' });
  assert.equal(fashionOnly.length, 1);
  assert.equal(fashionOnly[0].id, '1');

  const amazonOnly = filterProducts(dummy, { affiliatePlatform: 'amazon' });
  assert.equal(amazonOnly.length, 1);

  const searchResults = filterProducts(dummy, { searchQuery: 'pour over' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '2');

  const priceFiltered = filterProducts(dummy, { maxPrice: 100 });
  assert.equal(priceFiltered.length, 1);
  assert.equal(priceFiltered[0].id, '2');
});
