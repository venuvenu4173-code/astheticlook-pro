import { AffiliateClick } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { extractReferrerDomain } from '../utils/pricing';

const LOCAL_CLICKS_KEY = 'aesthetic_look_clicks';

function getLocalClicks(): AffiliateClick[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLICKS_KEY);
    if (!raw) {
      // Initialize with sample real click timestamps for analytics demonstration
      const initial: AffiliateClick[] = [
        {
          id: 'clk-01',
          productId: 'prod-001',
          productName: 'Tailored Double-Breasted Wool Overcoat',
          clickedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          affiliatePlatform: 'SSENSE',
          referrerDomain: 'instagram.com',
        },
        {
          id: 'clk-02',
          productId: 'prod-004',
          productName: 'Botanical Squalane & Ceramide Night Nectar',
          clickedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          affiliatePlatform: 'Amazon',
          referrerDomain: 'google.com',
        },
        {
          id: 'clk-03',
          productId: 'prod-006',
          productName: 'Precision Studio Matte Black ANC Headphones',
          clickedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
          affiliatePlatform: 'Amazon',
          referrerDomain: 'asthetic-look.pro',
        },
        {
          id: 'clk-04',
          productId: 'prod-001',
          productName: 'Tailored Double-Breasted Wool Overcoat',
          clickedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          affiliatePlatform: 'SSENSE',
          referrerDomain: 'instagram.com',
        },
        {
          id: 'clk-05',
          productId: 'prod-008',
          productName: 'Sculptural Raw Stoneware Vessel',
          clickedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          affiliatePlatform: 'Zara',
          referrerDomain: 'pinterest.com',
        },
        {
          id: 'clk-06',
          productId: 'prod-012',
          productName: 'Acetate Square Architectural Sunglasses',
          clickedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          affiliatePlatform: 'SSENSE',
          referrerDomain: 'google.com',
        },
      ];
      localStorage.setItem(LOCAL_CLICKS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalClicks(clicks: AffiliateClick[]): void {
  try {
    localStorage.setItem(LOCAL_CLICKS_KEY, JSON.stringify(clicks));
  } catch (err) {
    console.error('Failed to save clicks to localStorage:', err);
  }
}

export const clickService = {
  /**
   * Records an outbound affiliate click event.
   */
  async recordClick(params: {
    productId: string;
    productName: string;
    affiliatePlatform: string;
  }): Promise<void> {
    const referrerDomain = extractReferrerDomain(document.referrer) || 'direct';
    const clickedAt = new Date().toISOString();

    // 1. Try Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('affiliate_clicks').insert({
          product_id: params.productId,
          affiliate_platform: params.affiliatePlatform,
          referrer_domain: referrerDomain,
          clicked_at: clickedAt,
        });
      } catch (err) {
        console.warn('Supabase recordClick error:', err);
      }
    }

    // 2. Also keep in local history for immediate client analytics
    const clicks = getLocalClicks();
    clicks.unshift({
      id: `clk-${Date.now()}`,
      productId: params.productId,
      productName: params.productName,
      affiliatePlatform: params.affiliatePlatform,
      referrerDomain,
      clickedAt,
    });
    saveLocalClicks(clicks.slice(0, 500)); // retain last 500
  },

  /**
   * Retrieves click analytics and aggregates.
   */
  async getClickAnalytics(filterPeriodDays?: number): Promise<{
    totalClicks: number;
    platformBreakdown: Record<string, number>;
    productBreakdown: { productId: string; productName: string; clicks: number }[];
    recentClicks: AffiliateClick[];
  }> {
    let clicks = getLocalClicks();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('affiliate_clicks')
          .select(`
            id,
            product_id,
            clicked_at,
            affiliate_platform,
            referrer_domain,
            product:products(name)
          `)
          .order('clicked_at', { ascending: false })
          .limit(200);

        if (!error && data) {
          clicks = data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            productName: d.product?.name || 'Unknown Product',
            clickedAt: d.clicked_at,
            affiliatePlatform: d.affiliate_platform,
            referrerDomain: d.referrer_domain,
          }));
        }
      } catch (err) {
        console.warn('Supabase getClickAnalytics error:', err);
      }
    }

    if (filterPeriodDays) {
      const cutoff = Date.now() - filterPeriodDays * 86400000;
      clicks = clicks.filter((c) => new Date(c.clickedAt).getTime() >= cutoff);
    }

    const platformBreakdown: Record<string, number> = {};
    const productCountMap: Record<string, { name: string; count: number }> = {};

    for (const c of clicks) {
      const plat = c.affiliatePlatform || 'Other';
      platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;

      if (!productCountMap[c.productId]) {
        productCountMap[c.productId] = { name: c.productName || c.productId, count: 0 };
      }
      productCountMap[c.productId].count += 1;
    }

    const productBreakdown = Object.entries(productCountMap)
      .map(([productId, item]) => ({
        productId,
        productName: item.name,
        clicks: item.count,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return {
      totalClicks: clicks.length,
      platformBreakdown,
      productBreakdown,
      recentClicks: clicks.slice(0, 50),
    };
  },
};
