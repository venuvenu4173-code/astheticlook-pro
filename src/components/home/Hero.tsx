import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Compass } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Value Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2ECE3] border border-[#DDD5C7] rounded-full text-[11px] font-medium tracking-widest uppercase text-[#5A5047]">
              <Sparkles className="w-3 h-3 text-[#B87A44]" />
              <span>Autumn / Winter Luxury Edit 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A1816] leading-[1.08] text-balance">
              DISCOVER <br />
              <span className="italic font-normal text-[#6B5E54]">YOUR TRUE</span> STYLE.
            </h1>

            <p className="text-base sm:text-lg text-[#5A5047] leading-relaxed max-w-xl font-light">
              An uncompromising digital salon celebrating refined sartorial essentials, artisanal grooming formulations, and architectural design objects. Curated daily with verified retailer availability.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1A1816] text-[#FAF8F5] rounded-xl text-sm font-semibold tracking-wide hover:bg-[#2C2622] transition-colors shadow-sm"
              >
                <span>Explore The Edit</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#D8D2C6] text-[#1A1816] rounded-xl text-sm font-semibold tracking-wide hover:bg-[#F5F1E9] transition-colors"
              >
                <Compass className="w-4 h-4 text-[#8C7E74]" />
                <span>Browse Categories</span>
              </Link>
            </div>

            {/* Trust and Curation Pillars (Clean unboxed metadata) */}
            <div className="pt-6 border-t border-[#E8E2D7] grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-mono text-lg font-bold text-[#1A1816]">100%</p>
                <p className="text-[#8C7E74] font-medium mt-0.5">Verified Retailers</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-[#1A1816]">Daily</p>
                <p className="text-[#8C7E74] font-medium mt-0.5">Editorial Selection</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-[#1A1816]">0%</p>
                <p className="text-[#8C7E74] font-medium mt-0.5">Added Markups</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Framing */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#EFEAE1] border border-[#DDD5C7] shadow-xl">
              <img
                src="/assets/aistudio/image_37848e19.png"
                alt="Aesthetic Look Editorial Art"
                className="w-full h-full object-cover p-6 bg-[#FAF8F5] transition-transform duration-700 hover:scale-105"
              />

              {/* Floating Editorial Quote Card */}
              <div className="absolute bottom-5 inset-x-5 bg-white/95 backdrop-blur-md border border-[#E8E2D7] p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A1816] text-[#E4A853] flex items-center justify-center font-serif italic font-bold text-xs shrink-0">
                    AL
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1A1816]">
                      "Style is an architecture of self-respect."
                    </p>
                    <p className="text-[10px] text-[#8C7E74] uppercase tracking-wider mt-0.5">
                      Curated by Aesthetic Look Editorial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
