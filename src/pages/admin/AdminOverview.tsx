import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  EyeOff,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  ArrowUpRight,
  PlusCircle,
  FolderTree,
  ExternalLink,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { clickService } from '../../services/clickService';
import { Product, Category } from '../../types';
import { formatPrice } from '../../utils/pricing';

export const AdminOverview: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalClicks: number;
    platformBreakdown: Record<string, number>;
    productBreakdown: { productId: string; productName: string; clicks: number }[];
    recentClicks: any[];
  }>({
    totalClicks: 0,
    platformBreakdown: {},
    productBreakdown: [],
    recentClicks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ onlyActive: false }),
      categoryService.getCategories(false),
      clickService.getClickAnalytics(),
    ]).then(([prods, cats, clickData]) => {
      setProducts(prods);
      setCategories(cats);
      setAnalytics(clickData);
      setLoading(false);
    });
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const inactiveProducts = totalProducts - activeProducts;
  const featuredProducts = products.filter((p) => p.isFeatured).length;
  const trendingProducts = products.filter((p) => p.isTrending).length;

  const statCards = [
    { label: 'Total Products', val: totalProducts, icon: Package, link: '/admin/products' },
    { label: 'Active Catalog', val: activeProducts, icon: CheckCircle, link: '/admin/products' },
    { label: 'Inactive / Drafts', val: inactiveProducts, icon: EyeOff, link: '/admin/products' },
    { label: 'Featured Curations', val: featuredProducts, icon: Sparkles, link: '/admin/products' },
    { label: 'Trending Signals', val: trendingProducts, icon: TrendingUp, link: '/admin/products' },
    { label: 'Total Affiliate Clicks', val: analytics.totalClicks, icon: MousePointerClick, link: '/admin/analytics' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Platform Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF8F5] border border-[#D8D2C6] text-[#1A1816] rounded-xl text-xs font-semibold tracking-wide transition-colors"
          >
            <FolderTree className="w-4 h-4 text-[#8C7E74]" />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="bg-white border border-[#E8E2D7] rounded-xl p-4 hover:border-[#1A1816] transition-all hover:shadow-sm group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#8C7E74] mb-3">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4 text-[#A69B91] group-hover:text-[#1A1816] transition-colors" />
              </div>
              <p className="font-mono text-2xl font-bold text-[#1A1816]">
                {stat.val}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Mid Section: Platform Click Breakdown & Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Most Clicked Products */}
        <div className="lg:col-span-7 bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EAE1]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                Most Clicked Affiliate Products
              </h3>
              <p className="text-xs text-[#7A6E65]">
                Real-time outbound engagement tracked across active listings.
              </p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-semibold text-[#8E3B29] hover:underline">
              Detailed Analytics &rarr;
            </Link>
          </div>

          {analytics.productBreakdown.length > 0 ? (
            <div className="divide-y divide-[#F2ECE4]">
              {analytics.productBreakdown.slice(0, 5).map((item, idx) => (
                <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="font-mono font-bold text-[#8C7E74] w-4">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold text-[#1A1816] truncate">
                      {item.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-[#1A1816] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E8E2D7]">
                      {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7A6E65] py-4">No click events recorded yet.</p>
          )}
        </div>

        {/* Platform Share */}
        <div className="lg:col-span-5 bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="mb-4 pb-3 border-b border-[#F0EAE1]">
            <h3 className="font-serif text-lg font-bold text-[#1A1816]">
              Clicks by Affiliate Retailer
            </h3>
            <p className="text-xs text-[#7A6E65]">
              Volume distribution across authorized merchant partners.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.platformBreakdown).length > 0 ? (
              Object.entries(analytics.platformBreakdown).map(([platform, count]) => {
                const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
                return (
                  <div key={platform} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1A1816]">{platform}</span>
                      <span className="font-mono text-[#8C7E74]">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F5F1E9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A1816] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#7A6E65] py-4">No platform data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EAE1]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1A1816]">
              Recent Outbound Activity Log
            </h3>
            <p className="text-xs text-[#7A6E65]">
              Real-time audit log of customer clicks into partner stores.
            </p>
          </div>
          <span className="font-mono text-xs text-[#8C7E74]">
            Showing last {Math.min(5, analytics.recentClicks.length)} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8C7E74] uppercase tracking-wider font-semibold border-b border-[#E8E2D7]">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Retailer Platform</th>
                <th className="py-2.5 px-4">Referrer Domain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {analytics.recentClicks.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#7A6E65]">
                    {new Date(log.clickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1A1816]">
                    {log.productName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#FAF5ED] font-mono text-[11px] font-semibold text-[#1A1816]">
                      {log.affiliatePlatform}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#8C7E74]">
                    {log.referrerDomain || 'direct'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
