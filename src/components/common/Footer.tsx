import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowUpRight, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-[#141210] text-[#EFEAE2] border-t border-[#2A2622] pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2A2622]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/image_37848e19.png"
                alt="Aesthetic Look"
                className="w-10 h-10 rounded-full object-cover border border-[#423C36]"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#FAF8F5]">
                  {settings.brandName || 'AESTHETIC LOOK'}
                </h3>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#A69B91]">
                  {settings.tagline || 'DISCOVER YOUR STYLE.'}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#B3A89D] leading-relaxed max-w-md">
              {settings.footerDescription}
            </p>

            {/* Instagram Social CTA */}
            <div className="pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#231F1C] hover:bg-[#2F2A26] border border-[#3A342E] text-xs font-medium text-[#FAF8F5] rounded-lg transition-colors group"
              >
                <Instagram className="w-4 h-4 text-[#E4A853] transition-transform group-hover:scale-110" />
                <span>Follow @asthetic_look.pro</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#A69B91]" />
              </a>
            </div>
          </div>

          {/* Editorial Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B3A89D]">
              <li>
                <Link to="/category/fashion-accessories" className="hover:text-white transition-colors">
                  Fashion & Accessories
                </Link>
              </li>
              <li>
                <Link to="/category/grooming-skincare" className="hover:text-white transition-colors">
                  Grooming & Skincare
                </Link>
              </li>
              <li>
                <Link to="/category/tech-gadgets" className="hover:text-white transition-colors">
                  Tech Gadgets
                </Link>
              </li>
              <li>
                <Link to="/category/lifestyle" className="hover:text-white transition-colors">
                  Lifestyle Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/category/budget-finds" className="hover:text-white transition-colors">
                  Budget Finds
                </Link>
              </li>
              <li>
                <Link to="/category/trending-deals" className="hover:text-white transition-colors">
                  Trending Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Discovery & Tools */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold mb-4">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B3A89D]">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  All Curated Edits
                </Link>
              </li>
              <li>
                <Link to="/explore?filter=trending" className="hover:text-white transition-colors">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Product Comparison
                </Link>
              </li>
              <li>
                <Link to="/disclosure" className="hover:text-white transition-colors">
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B3A89D]">
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8C7E74]" />
                  <span>{settings.contactEmail}</span>
                </a>
              </li>
              <li className="pt-2 text-xs text-[#8C7E74] leading-relaxed">
                Empowered by Supabase Database, Auth, and Storage.
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="py-6 border-b border-[#2A2622] text-xs text-[#8C7E74] leading-relaxed">
          <p className="font-medium text-[#B3A89D] mb-1 uppercase tracking-wider text-[11px]">
            Affiliate Transparency Notice
          </p>
          <p>{settings.affiliateDisclosure}</p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A6E65] gap-4">
          <p>© {new Date().getFullYear()} AESTHETIC LOOK. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/disclosure" className="hover:text-[#B3A89D] transition-colors">
              Terms & Disclosure
            </Link>
            <Link to="/disclosure" className="hover:text-[#B3A89D] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#423C36]">·</span>
            <span>Discover Your Style</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
