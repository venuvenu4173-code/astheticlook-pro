import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, SlidersHorizontal, Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { wishlistIds, compareIds, settings, setSearchOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Categories', href: '/categories' },
    { label: 'Trending', href: '/explore?filter=trending' },
    { label: 'Wishlist', href: '/wishlist', count: wishlistIds.length },
    { label: 'Compare', href: '/compare', count: compareIds.length },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D7]">
      {/* Announcement Bar */}
      {settings.announcementEnabled && settings.announcementText && (
        <div className="bg-[#1A1816] text-[#EFEAE2] px-4 py-2 text-center text-xs tracking-wider uppercase font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{settings.announcementText}</span>
            <Link
              to="/explore"
              className="hidden sm:inline-flex items-center gap-0.5 text-[#D4AF37] hover:underline normal-case tracking-normal text-xs ml-2"
            >
              Shop Curated Edits <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & Icon */}
        <Link
          to="/"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <img
            src="/assets/aistudio/image_37848e19.png"
            alt="Aesthetic Look Logo"
            className="w-11 h-11 rounded-full object-cover border border-[#D8D2C6] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1816] leading-none">
              AESTHETIC LOOK
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C7E74] font-medium mt-0.5">
              Discover Your Style
            </span>
          </div>
        </Link>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5A5047]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive ? 'text-[#1A1816] font-semibold' : 'hover:text-[#1A1816]'
                }`}
              >
                {link.label}
                {link.count !== undefined && link.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-[#1A1816] text-[#FAF8F5]">
                    {link.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#1A1816]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (Search & Tools) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open instant search"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5A5047] hover:text-[#1A1816] bg-[#F3EFEA] hover:bg-[#EBE5DC] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-4 h-4 text-[#7A6E65]" />
            <span className="hidden sm:inline">Search edits...</span>
            <kbd className="hidden lg:inline text-[10px] text-[#A69B91] border border-[#D8D2C6] rounded px-1.5 py-0.5 bg-white font-mono">
              /
            </kbd>
          </button>

          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A1816] border border-[#D8D2C6] rounded-lg hover:bg-white transition-colors whitespace-nowrap shrink-0"
            title="Admin Dashboard & Database"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C7E74]" />
            <span>Admin</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1816] hover:bg-[#F3EFEA] rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D7] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 text-base font-medium text-[#1A1816] border-b border-[#F0EAE1]"
            >
              <span>{link.label}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#1A1816] text-[#FAF8F5]">
                  {link.count}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-3 flex gap-3">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-medium border border-[#D8D2C6] rounded-lg bg-white"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
