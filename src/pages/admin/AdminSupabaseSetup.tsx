import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  HardDrive,
  Key,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Save,
  Trash2,
} from 'lucide-react';
import {
  checkSupabaseConnection,
  getSupabaseCredentials,
  saveRuntimeSupabaseConfig,
  clearRuntimeSupabaseConfig,
  SupabaseStatus,
  supabase,
} from '../../lib/supabase';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from '../../data/seedData';

const SQL_MIGRATION_SCRIPT = `-- ==============================================================================
-- AESTHETIC LOOK — PREMIUM LUXURY AFFILIATE E-COMMERCE PLATFORM
-- Production Database Schema, Security Policies & Storage Configuration
-- File: supabase/migrations/001_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_path TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    affiliate_platform TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    current_price NUMERIC(10, 2),
    original_price NUMERIC(10, 2),
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_trending ON public.products(is_trending);
CREATE INDEX IF NOT EXISTS idx_products_platform ON public.products(affiliate_platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    alt_text TEXT,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_main ON public.product_images(product_id, is_main);

-- 5. AFFILIATE CLICKS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    affiliate_platform TEXT NOT NULL,
    referrer_domain TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON public.affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_timestamp ON public.affiliate_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_platform ON public.affiliate_clicks(affiliate_platform);

-- 6. ADMIN PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 9. ROW LEVEL SECURITY (RLS) ACTIVATION
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to identify authenticated owner admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated'
        AND (
            LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ashokboya4173@gmail.com'
            OR EXISTS (
                SELECT 1 FROM public.admin_profiles
                WHERE id = auth.uid() AND role IN ('owner_admin', 'admin')
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-provision owner_admin profile when user is created in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    IF LOWER(NEW.email) = 'ashokboya4173@gmail.com' THEN
        INSERT INTO public.admin_profiles (id, role)
        VALUES (NEW.id, 'owner_admin')
        ON CONFLICT (id) DO UPDATE SET role = 'owner_admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_admin_created ON auth.users;
CREATE TRIGGER on_auth_user_admin_created
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_admin_auth_user();

-- 10. CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.is_admin());

-- 11. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING (public.is_admin());

-- 12. PRODUCT IMAGES POLICIES
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images"
ON public.product_images FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Admins can insert product images" ON public.product_images;
CREATE POLICY "Admins can insert product images"
ON public.product_images FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON public.product_images;
CREATE POLICY "Admins can update product images"
ON public.product_images FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON public.product_images;
CREATE POLICY "Admins can delete product images"
ON public.product_images FOR DELETE
USING (public.is_admin());

-- 13. AFFILIATE CLICKS POLICIES
DROP POLICY IF EXISTS "Public can log affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "Public can log affiliate clicks"
ON public.affiliate_clicks FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can view click analytics" ON public.affiliate_clicks;
CREATE POLICY "Admins can view click analytics"
ON public.affiliate_clicks FOR SELECT
USING (public.is_admin());

-- 14. WEBSITE SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can view website settings" ON public.website_settings;
CREATE POLICY "Public can view website settings"
ON public.website_settings FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Admins can modify website settings" ON public.website_settings;
CREATE POLICY "Admins can modify website settings"
ON public.website_settings FOR ALL
USING (public.is_admin());

-- 15. ADMIN PROFILES POLICIES
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- 16. STORAGE BUCKET: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can view product images bucket" ON storage.objects;
CREATE POLICY "Public can view product images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload to product images bucket" ON storage.objects;
CREATE POLICY "Admins can upload to product images bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update in product images bucket" ON storage.objects;
CREATE POLICY "Admins can update in product images bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete from product images bucket" ON storage.objects;
CREATE POLICY "Admins can delete from product images bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin());
`;

export const AdminSupabaseSetup: React.FC = () => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Editable credentials state
  const initialCreds = getSupabaseCredentials();
  const [customUrl, setCustomUrl] = useState(initialCreds.url);
  const [customKey, setCustomKey] = useState(initialCreds.key);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) return;
    saveRuntimeSupabaseConfig(customUrl.trim(), customKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    runCheck();
  };

  const handleResetToEnv = () => {
    clearRuntimeSupabaseConfig();
    const creds = getSupabaseCredentials();
    setCustomUrl(creds.url);
    setCustomKey(creds.key);
    runCheck();
  };

  const handleSeedSupabase = async () => {
    if (!status?.connected) {
      setSeedNotice('Cannot seed: Supabase is not connected yet.');
      return;
    }

    if (status?.schemaPending) {
      setSeedNotice('Please run the SQL migration script in your Supabase SQL Editor first, then click "Seed Catalog".');
      return;
    }

    if (!supabase) {
      setSeedNotice('Supabase client is not initialized.');
      return;
    }

    setSeeding(true);
    setSeedNotice(null);

    try {
      // 1. Seed categories
      for (const cat of INITIAL_CATEGORIES) {
        await supabase.from('categories').upsert({
          name: cat.name,
          slug: cat.slug,
          is_active: cat.isActive,
          display_order: cat.displayOrder,
        });
      }

      // 2. Fetch category mapping
      const { data: dbCategories } = await supabase.from('categories').select('id, slug');
      const catMap = new Map((dbCategories || []).map((c: any) => [c.slug, c.id]));

      // 3. Seed products
      for (const prod of INITIAL_PRODUCTS) {
        const matchingCatId = catMap.get(
          INITIAL_CATEGORIES.find((c) => c.id === prod.categoryId)?.slug || ''
        );

        const { data: productRow } = await supabase
          .from('products')
          .upsert({
            name: prod.name,
            slug: prod.slug,
            short_description: prod.shortDescription,
            description: prod.description,
            category_id: matchingCatId || null,
            affiliate_platform: prod.affiliatePlatform,
            affiliate_url: prod.affiliateUrl,
            current_price: prod.currentPrice,
            original_price: prod.originalPrice,
            is_featured: prod.isFeatured,
            is_trending: prod.isTrending,
            is_active: prod.isActive,
          })
          .select()
          .single();

        if (productRow && prod.images) {
          const imgRows = prod.images.map((img, idx) => ({
            product_id: productRow.id,
            storage_path: img.storagePath,
            public_url: img.publicUrl,
            alt_text: img.altText || prod.name,
            is_main: img.isMain,
            display_order: idx + 1,
          }));
          await supabase.from('product_images').insert(imgRows);
        }
      }

      // 4. Seed settings
      await supabase.from('website_settings').upsert({
        key: 'general',
        value: INITIAL_SETTINGS,
      });

      setSeedNotice('Successfully seeded initial luxury catalog & settings to Supabase Database!');
      runCheck();
    } catch (err: any) {
      setSeedNotice(`Seeding failed: ${err.message}. Ensure the SQL migration was executed in Supabase.`);
    } finally {
      setSeeding(false);
    }
  };

  const getMaskedKey = (key: string) => {
    if (!key) return 'None';
    if (key.length <= 12) return '••••••••';
    return `${key.slice(0, 10)}...${key.slice(-4)}`;
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Backend Architecture
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Supabase Integration & Health
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Production PostgreSQL Database, Row Level Security, Auth & Storage Bucket configuration.
          </p>
        </div>

        <button
          onClick={runCheck}
          disabled={checking}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D8D2C6] text-[#1A1816] rounded-xl text-xs font-semibold hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking Connection...' : 'Re-verify Connection'}</span>
        </button>
      </div>

      {/* Primary Status Banner */}
      {status && (
        <div
          className={`p-5 rounded-2xl border ${
            status.connected && status.tablesVerified
              ? 'bg-[#F2F8F4] border-[#CDE5D4] text-[#245D33]'
              : status.connected && status.schemaPending
              ? 'bg-[#FFF9EE] border-[#F2DEB5] text-[#875817]'
              : 'bg-[#FAF0ED] border-[#F2C4B8] text-[#8E3B29]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {status.connected && status.tablesVerified ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#2E7D44]" />
            ) : status.connected && status.schemaPending ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B87A44]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B93822]" />
            )}
            <div className="space-y-1">
              <h3 className="text-sm font-bold">
                {status.connected && status.tablesVerified
                  ? 'Supabase Connection Verified & Database Ready'
                  : status.connected && status.schemaPending
                  ? 'Supabase Connected & Authenticated — SQL Migration Pending'
                  : 'Supabase Connection Attention Needed'}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                {status.connected && status.tablesVerified
                  ? 'The application is actively connected to your remote Supabase PostgreSQL database. Products, categories, images, and analytics are writing to Supabase.'
                  : status.connected && status.schemaPending
                  ? 'Authentication succeeded and the Supabase API responded, but the database tables ("products", "categories", etc.) have not been created yet. Copy and run the SQL migration below in your Supabase SQL Editor.'
                  : status.error || 'Please configure your Supabase Project URL and Anon/Publishable API Key.'}
              </p>
              {status.details && (
                <p className="text-[11px] font-mono mt-1 opacity-80 bg-black/5 p-2 rounded-lg">
                  {status.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {seedNotice && (
        <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Database Endpoint</span>
            <Server className="w-4 h-4 text-[#B87A44]" />
          </div>
          <p className="font-mono text-xs font-bold text-[#1A1816] truncate" title={status?.url}>
            {status?.url && status.url !== 'Not Configured' ? status.url : 'Pending Configuration'}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px]">
            {status?.connected ? (
              <span className="text-[#2E7D44] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reachable & Active
              </span>
            ) : (
              <span className="text-[#B87A44] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {status?.error ? 'Error Connecting' : 'Pending in .env'}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Storage Bucket</span>
            <HardDrive className="w-4 h-4 text-[#5A5047]" />
          </div>
          <p className="font-mono text-sm font-bold text-[#1A1816]">
            product-images
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px]">
            {status?.storageBucketVerified ? (
              <span className="text-[#2E7D44] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bucket Ready for Uploads
              </span>
            ) : status?.connected ? (
              <span className="text-[#8C7E74]">
                Bucket will be created via SQL migration
              </span>
            ) : (
              <span className="text-[#8C7E74]">
                Direct device uploads enabled
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#8C7E74] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Database Schema</span>
            <ShieldCheck className="w-4 h-4 text-[#2E7D44]" />
          </div>
          <p className="font-mono text-sm font-bold text-[#1A1816]">
            {status?.tablesVerified ? 'Tables Verified' : status?.schemaPending ? 'Migration Needed' : 'Pending Connection'}
          </p>
          <div className="mt-3 text-[11px] text-[#7A6E65]">
            {status?.tablesVerified
              ? 'Tables (products, categories, clicks) exist.'
              : 'Run the SQL script in Supabase to build tables.'}
          </div>
        </div>
      </div>

      {/* Credential Manager Form */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1A1816]">
              Supabase Project Credentials
            </h3>
            <p className="text-xs text-[#7A6E65] mt-0.5">
              Configured in <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[#1A1816]">.env</code> / <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded text-[#1A1816]">.env.example</code> with live runtime override support.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToEnv}
              className="text-xs text-[#8C7E74] hover:text-[#1A1816] underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset to File Values</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1">
                Anon / Publishable API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                required
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="sb_publishable_... or eyJhbGciOi..."
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
              <span className="text-[10px] text-[#8C7E74] mt-1 block">
                Current key: {getMaskedKey(customKey)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#2E7D44] font-medium">
              {saveSuccess && 'Credentials saved and tested!'}
            </span>
            <button
              type="submit"
              disabled={checking}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Test Connection</span>
            </button>
          </div>
        </form>
      </div>

      {/* One-Click Seed Catalog Action */}
      <div className="bg-[#FAF5ED] border border-[#E0D4BE] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#875817] mb-1">
            <Sparkles className="w-4 h-4 text-[#B87A44]" />
            <span>Database Initialization</span>
          </div>
          <h4 className="font-serif text-lg font-bold text-[#1A1816]">
            Seed Verified Luxury Catalog to Supabase
          </h4>
          <p className="text-xs text-[#7A6E65] mt-1 max-w-xl">
            Populate your Supabase tables with the complete set of verified luxury fashion, skincare, audio, and design products.
            {status?.schemaPending && ' (Note: Run the SQL migration script first so tables exist).'}
          </p>
        </div>

        <button
          onClick={handleSeedSupabase}
          disabled={seeding || checking}
          className="px-6 py-3 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          {seeding ? 'Seeding Database...' : 'Seed Catalog to Supabase'}
        </button>
      </div>

      {/* Instructions for Production Connection */}
      <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
          <h3 className="font-serif text-xl font-bold text-[#1A1816]">
            Setup Instructions for Supabase
          </h3>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#B87A44] font-semibold hover:underline"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4 text-xs text-[#5A5047] leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1A1816] text-white flex items-center justify-center font-bold font-mono shrink-0">
              1
            </span>
            <div>
              <strong className="text-[#1A1816] block mb-0.5">Create a Supabase Project & Copy API Keys</strong>
              <span>
                Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">supabase.com/dashboard</a>, open your project, and navigate to <strong>Project Settings &gt; API</strong> to copy your Project URL and Publishable/Anon API Key.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1A1816] text-white flex items-center justify-center font-bold font-mono shrink-0">
              2
            </span>
            <div>
              <strong className="text-[#1A1816] block mb-0.5">Run the SQL Migration in Supabase SQL Editor</strong>
              <span>
                Open your Supabase project &gt; <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, click the <strong>"Copy SQL Script"</strong> button below, paste it, and click <strong>"Run"</strong>. This creates the PostgreSQL tables, indexes, Row Level Security policies, and the <code className="bg-[#FAF8F5] px-1 border border-[#D8D2C6] rounded">product-images</code> storage bucket.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1A1816] text-white flex items-center justify-center font-bold font-mono shrink-0">
              3
            </span>
            <div>
              <strong className="text-[#1A1816] block mb-0.5">Seed Products or Add Products via Admin</strong>
              <span>
                Once the SQL script executes, click the <strong>"Seed Catalog to Supabase"</strong> button above, or navigate to <strong>Products &gt; Add Product</strong> to add listings directly with device image uploads!
              </span>
            </div>
          </div>
        </div>

        {/* SQL Script View & Copy */}
        <div className="pt-4 border-t border-[#F0EAE1] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] block">
                Schema Migration Script (001_initial_schema.sql)
              </span>
              <span className="text-[11px] text-[#8C7E74]">
                Creates categories, products, product_images, affiliate_clicks, and storage policies
              </span>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#1A1816] transition-colors cursor-pointer shadow-sm"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2E7D44]" />
                  <span>SQL Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-[#141210] text-[#D8D2C6] rounded-xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed selection:bg-[#B87A44]/30">
            {SQL_MIGRATION_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
};
