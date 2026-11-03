import React from 'react';
import { ShieldCheck, Info, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AffiliateDisclosurePage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F1E9] border border-[#DDD5C7] rounded-full text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B87A44]" />
              <span>FTC & Global Standards Compliance</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816]">
              Affiliate Transparency Disclosure & Terms
            </h1>
            <p className="text-sm text-[#7A6E65] mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-stone text-sm text-[#5A5047] leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1816]">1. Editorial Independence & Affiliate Relationships</h2>
              <p>
                {settings.affiliateDisclosure}
              </p>
              <p>
                Aesthetic Look is an independently curated digital publication and product discovery platform. We partner with reputable online merchants, luxury retailers, and affiliate networks (including Amazon Associates, Flipkart Affiliate Program, SSENSE, Farfetch, Zara, and others) to recommend items that meet our aesthetic, craftsmanship, and performance standards.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1816]">2. Zero Additional Cost to You</h2>
              <p>
                When you click on an affiliate link and make a purchase on a merchant's website, the merchant pays Aesthetic Look a modest referral fee. This does <strong>not</strong> increase the purchase price you pay. The price remains identical to or, in cases where exclusive discounts apply, lower than visiting the store directly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1816]">3. Pricing & Retailer Availability</h2>
              <p>
                Prices and availability of products are accurate at the time of publication and are retrieved directly from verified retailers. However, prices and product availability are subject to change at any time by the retailer. Always verify the current price, shipping policies, and return conditions on the official retailer checkout page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1816]">4. Privacy & Click Tracking</h2>
              <p>
                When an external link is clicked, we log minimal routing metadata (the product identifier, timestamp, and retailer name) for performance analytics and affiliate reconciliation. We do not sell personal data, nor do we retain credit card or payment information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1816]">5. Contact & Inquiries</h2>
              <p>
                If you have questions regarding our editorial curation, affiliate partnerships, or disclosure policies, please contact our editorial desk at{' '}
                <a href={`mailto:${settings.contactEmail}`} className="text-[#1A1816] font-semibold underline">
                  {settings.contactEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
