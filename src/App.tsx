/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminAuthProvider, useAdminAuth } from './pages/admin/AdminAuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { SearchModal } from './components/common/SearchModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { AffiliateDisclosurePage } from './pages/AffiliateDisclosurePage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminPlatforms } from './pages/admin/AdminPlatforms';
import { AdminImageLibrary } from './pages/admin/AdminImageLibrary';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSupabaseSetup } from './pages/admin/AdminSupabaseSetup';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Guard for Admin
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

// Public Layout Wrapper
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuickViewModal />
      <SearchModal />
    </div>
  );
}

// 404 Page
function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-serif text-5xl font-bold text-[#1A1816]">404</h1>
      <p className="text-sm text-[#7A6E65] mt-2 mb-6">This curated page does not exist or has been relocated.</p>
      <a
        href="/"
        className="px-6 py-3 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2C2622]"
      >
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AdminAuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Storefront Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/explore"
              element={
                <PublicLayout>
                  <ExplorePage />
                </PublicLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <PublicLayout>
                  <CategoriesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <PublicLayout>
                  <CategoryDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/product/:slug"
              element={
                <PublicLayout>
                  <ProductDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PublicLayout>
                  <WishlistPage />
                </PublicLayout>
              }
            />
            <Route
              path="/compare"
              element={
                <PublicLayout>
                  <ComparePage />
                </PublicLayout>
              }
            />
            <Route
              path="/disclosure"
              element={
                <PublicLayout>
                  <AffiliateDisclosurePage />
                </PublicLayout>
              }
            />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Console Routes */}
            <Route
              path="/admin"
              element={
                <AdminRouteGuard>
                  <AdminLayout />
                </AdminRouteGuard>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="platforms" element={<AdminPlatforms />} />
              <Route path="images" element={<AdminImageLibrary />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="supabase" element={<AdminSupabaseSetup />} />
            </Route>

            {/* Fallback 404 */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFound />
                </PublicLayout>
              }
            />
          </Routes>
        </AdminAuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
