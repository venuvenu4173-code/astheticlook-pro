import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, MousePointerClick, TrendingUp, Layers, ExternalLink } from 'lucide-react';
import { clickService } from '../../services/clickService';
import { AffiliateClick } from '../../types';

export const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30); // 30 days default
  const [analytics, setAnalytics] = useState<{
    totalClicks: number;
    platformBreakdown: Record<string, number>;
    productBreakdown: { productId: string; productName: string; clicks: number }[];
    recentClicks: AffiliateClick[];
  }>({
    totalClicks: 0,
    platformBreakdown: {},
    productBreakdown: [],
    recentClicks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clickService.getClickAnalytics(period === 0 ? undefined : period).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [period]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Performance Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Affiliate Click Analytics
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Audit outbound referral traffic recorded across all curated items.
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D8D2C6] rounded-xl text-xs font-semibold">
          {[
            { label: 'Today', days: 1 },
            { label: 'Last 7 Days', days: 7 },
            { label: 'Last 30 Days', days: 30 },
            { label: 'All Time', days: 0 },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setPeriod(item.days)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === item.days
                  ? 'bg-[#1A1816] text-[#FAF8F5]'
                  : 'text-[#7A6E65] hover:text-[#1A1816]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Outbound Clicks</span>
            <MousePointerClick className="w-5 h-5 text-[#B87A44]" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#1A1816]">
            {analytics.totalClicks}
          </p>
          <p className="text-[11px] text-[#7A6E65] mt-1">
            Logged across active partner campaigns.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Retailers</span>
            <Layers className="w-5 h-5 text-[#5A5047]" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#1A1816]">
            {Object.keys(analytics.platformBreakdown).length}
          </p>
          <p className="text-[11px] text-[#7A6E65] mt-1">
            Receiving referral traffic this period.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Top Performing Item</span>
            <TrendingUp className="w-5 h-5 text-[#2E7D44]" />
          </div>
          <p className="font-semibold text-sm text-[#1A1816] truncate">
            {analytics.productBreakdown[0]?.productName || 'None'}
          </p>
          <p className="font-mono text-xs text-[#8C7E74] mt-1">
            {analytics.productBreakdown[0]?.clicks || 0} clicks
          </p>
        </div>
      </div>

      {/* Grid: Retailer Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Retailers */}
        <div className="lg:col-span-5 bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            Clicks by Merchant Platform
          </h3>

          <div className="space-y-4">
            {Object.entries(analytics.platformBreakdown).length > 0 ? (
              Object.entries(analytics.platformBreakdown).map(([platform, count]) => {
                const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
                return (
                  <div key={platform} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1A1816]">{platform}</span>
                      <span className="font-mono font-medium text-[#7A6E65]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F5F1E9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A1816] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#7A6E65] py-4">No platform clicks recorded in selected period.</p>
            )}
          </div>
        </div>

        {/* Top Clicked Products */}
        <div className="lg:col-span-7 bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1] mb-2">
            Top Converted Products
          </h3>

          <div className="divide-y divide-[#F2ECE4]">
            {analytics.productBreakdown.length > 0 ? (
              analytics.productBreakdown.slice(0, 8).map((p, idx) => (
                <div key={p.productId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="font-mono font-bold text-[#8C7E74] w-4">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#1A1816] truncate">
                      {p.productName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#1A1816] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E8E2D7]">
                    {p.clicks} {p.clicks === 1 ? 'click' : 'clicks'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7A6E65] py-4">No product clicks logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Event Audit Stream */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
          Outbound Click Stream
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8C7E74] uppercase tracking-wider font-semibold border-b border-[#E8E2D7]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Item Name</th>
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-4">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {analytics.recentClicks.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]/80">
                  <td className="py-2.5 px-4 font-mono text-[#7A6E65]">
                    {new Date(log.clickedAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#1A1816]">
                    {log.productName}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#FAF5ED] font-mono text-[11px] font-semibold">
                      {log.affiliatePlatform}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#8C7E74]">
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
