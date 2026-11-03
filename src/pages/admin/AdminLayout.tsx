import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Image as ImageIcon,
  Link2,
  BarChart3,
  Settings,
  Database,
  LogOut,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export const AdminLayout: React.FC = () => {
  const { userEmail, logout, isDemoAuth } = useAdminAuth();
  const { settings } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Add Product', to: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', to: '/admin/categories', icon: FolderTree },
    { label: 'Image Library', to: '/admin/images', icon: ImageIcon },
    { label: 'Affiliate Platforms', to: '/admin/platforms', icon: Link2 },
    { label: 'Click Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Website Settings', to: '/admin/settings', icon: Settings },
    { label: 'Supabase Database', to: '/admin/supabase', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col md:flex-row text-[#1A1816]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141210] text-[#EFEAE2] flex flex-col shrink-0 border-r border-[#2A2622]">
        {/* Brand header */}
        <div className="p-5 border-b border-[#2A2622] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_37848e19.png"
              alt="Aesthetic Look Logo"
              className="w-8 h-8 rounded-full object-cover border border-[#423C36]"
            />
            <div>
              <span className="font-serif text-base font-bold text-white tracking-wide block leading-none">
                AESTHETIC LOOK
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#B3A89D]">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#26221E] text-[#FAF8F5] font-semibold border border-[#3E3832]'
                      : 'text-[#A69B91] hover:text-white hover:bg-[#1C1917]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Backend Status indicator */}
        <div className="p-3 mx-3 mb-3 bg-[#1C1917] rounded-xl border border-[#2E2822] text-xs">
          <div className="flex items-center gap-2 mb-1">
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4EAD6A]" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-[#E4A853]" />
            )}
            <span className="font-semibold text-white text-[11px]">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Fallback'}
            </span>
          </div>
          <p className="text-[10px] text-[#A69B91] leading-tight">
            {isSupabaseConfigured
              ? 'Real-time database, auth & storage active.'
              : 'Credentials pending in .env. Review SQL in setup tab.'}
          </p>
        </div>

        {/* User profile & actions */}
        <div className="p-4 border-t border-[#2A2622] flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <p className="font-medium text-white truncate text-[11px]">{userEmail}</p>
            <p className="text-[10px] text-[#8C7E74]">
              {isDemoAuth ? 'Admin Demo Mode' : 'Super Administrator'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out of admin"
            className="p-1.5 text-[#A69B91] hover:text-white hover:bg-[#26221E] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E8E2D7] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              Management Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A5047] hover:text-[#1A1816] px-3 py-1.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-lg transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8C7E74]" />
            </Link>
          </div>
        </header>

        {/* Dynamic Admin Sub-view */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
