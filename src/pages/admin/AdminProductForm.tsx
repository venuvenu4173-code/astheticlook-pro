import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  MoveLeft,
  MoveRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  FileImage,
  FolderTree,
  Copy,
  Check,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService, CATEGORY_SQL_SEED } from '../../services/categoryService';
import { uploadProductImage, validateImageFile, MAX_FILE_SIZE_BYTES } from '../../lib/storage';
import { Product, ProductImage, Category } from '../../types';
import { generateSlug, validateAffiliateUrl } from '../../utils/pricing';
import { isSupabaseConfigured } from '../../lib/supabase';

interface PendingUpload {
  id: string;
  file?: File;
  previewUrl: string;
  storagePath: string;
  isMain: boolean;
  altText: string;
  status: 'ready' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [seedingCategories, setSeedingCategories] = useState(false);
  const [copiedSqlSeed, setCopiedSqlSeed] = useState(false);
  const [isUsingPresets, setIsUsingPresets] = useState(false);
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [affiliatePlatform, setAffiliatePlatform] = useState('Amazon');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [images, setImages] = useState<PendingUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadCategories = async (): Promise<Category[]> => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const cats = await categoryService.getCategories(false);
      if (cats && cats.length > 0) {
        setCategories(cats);
        setIsUsingPresets(false);
        return cats;
      } else {
        const presets = categoryService.getStandardPresetCategories();
        setCategories(presets);
        setIsUsingPresets(true);
        return presets;
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setCategoriesError(err.message || 'Failed to load categories from database.');
      const presets = categoryService.getStandardPresetCategories();
      setCategories(presets);
      setIsUsingPresets(true);
      return presets;
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCopySqlSeed = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(CATEGORY_SQL_SEED);
      setCopiedSqlSeed(true);
      setTimeout(() => setCopiedSqlSeed(false), 3000);
    }
  };

  const handleSeedStandardCategories = async () => {
    setSeedingCategories(true);
    setCategoriesError(null);
    try {
      const seeded = await categoryService.ensureStandardCategories();
      setCategories(seeded);
      setIsUsingPresets(false);
      if (seeded.length > 0 && !categoryId) {
        setCategoryId(seeded[0].id);
      }
      setFormSuccess('The 6 standard luxury categories have been initialized successfully!');
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to initialize categories in Supabase:', err);
      // Pre-populate with standard preset categories so dropdown works immediately
      const presets = categoryService.getStandardPresetCategories();
      setCategories(presets);
      setIsUsingPresets(true);
      if (presets.length > 0 && !categoryId) {
        setCategoryId(presets[0].id);
      }
      setCategoriesError(err.message || 'Failed to initialize categories in database.');
    } finally {
      setSeedingCategories(false);
    }
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setQuickAddLoading(true);
    try {
      const created = await categoryService.createCategory({
        name: newCategoryName.trim(),
        slug: generateSlug(newCategoryName.trim()),
      });
      const updatedCats = await categoryService.getCategories(false);
      setCategories(updatedCats);
      setIsUsingPresets(false);
      setCategoryId(created.id);
      setNewCategoryName('');
      setShowQuickAddCategory(false);
      setFormSuccess(`Category "${created.name}" created and selected!`);
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      alert(`Could not create category: ${err.message}`);
    } finally {
      setQuickAddLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const [cats, targetProduct] = await Promise.all([
          categoryService.getCategories(false),
          isEditing && id ? productService.getProductById(id) : Promise.resolve(null),
        ]);

        let effectiveCats = cats;
        if (!cats || cats.length === 0) {
          effectiveCats = categoryService.getStandardPresetCategories();
          setIsUsingPresets(true);
        } else {
          setIsUsingPresets(false);
        }
        setCategories(effectiveCats);

        if (isEditing && targetProduct) {
          setName(targetProduct.name);
          setSlug(targetProduct.slug);
          setSlugCustomized(true);
          setShortDescription(targetProduct.shortDescription || '');
          setDescription(targetProduct.description || '');
          setAffiliatePlatform(targetProduct.affiliatePlatform);
          setAffiliateUrl(targetProduct.affiliateUrl);
          setCurrentPrice(targetProduct.currentPrice != null ? String(targetProduct.currentPrice) : '');
          setOriginalPrice(targetProduct.originalPrice != null ? String(targetProduct.originalPrice) : '');
          setIsFeatured(targetProduct.isFeatured);
          setIsTrending(targetProduct.isTrending);
          setIsActive(targetProduct.isActive);

          // Match current category accurately from fetched categories
          const targetCatKey = (targetProduct.categoryId || '').replace(/^(preset-|cat-)/, '').toLowerCase();
          const matched = effectiveCats.find(
            (c) =>
              c.id === targetProduct.categoryId ||
              c.slug === targetProduct.categoryId ||
              c.slug.replace(/^preset-/, '') === targetCatKey ||
              c.name.toLowerCase() === targetProduct.categoryName?.toLowerCase()
          );

          if (matched) {
            setCategoryId(matched.id);
          } else if (targetProduct.categoryId) {
            setCategoryId(targetProduct.categoryId);
          }

          const existingImgs: PendingUpload[] = (targetProduct.images || []).map((img, idx) => ({
            id: img.id || `img-${idx}`,
            previewUrl: img.publicUrl,
            storagePath: img.storagePath,
            isMain: img.isMain,
            altText: img.altText || targetProduct.name,
            status: 'success',
          }));
          setImages(existingImgs);
        } else {
          // In Add mode: default to first category if available
          if (effectiveCats.length > 0 && !categoryId) {
            setCategoryId(effectiveCats[0].id);
          }
        }
      } catch (err: any) {
        console.error('Initialization error in AdminProductForm:', err);
        setCategoriesError(err.message || 'Failed to initialize categories.');
        const presets = categoryService.getStandardPresetCategories();
        setCategories(presets);
        setIsUsingPresets(true);
        if (presets.length > 0 && !categoryId) {
          setCategoryId(presets[0].id);
        }
      } finally {
        setCategoriesLoading(false);
        setInitialLoading(false);
      }
    };

    initializeData();
  }, [id, isEditing]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugCustomized) {
      setSlug(generateSlug(val));
    }
  };

  // Image Upload Handling (Drag-and-Drop + Device Picker)
  const processFiles = (files: FileList | File[]) => {
    const newItems: PendingUpload[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateImageFile(file);
      const tempId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      if (!validation.valid) {
        newItems.push({
          id: tempId,
          file,
          previewUrl,
          storagePath: '',
          isMain: false,
          altText: file.name,
          status: 'error',
          error: validation.error,
        });
      } else {
        newItems.push({
          id: tempId,
          file,
          previewUrl,
          storagePath: '',
          isMain: images.length === 0 && newItems.length === 0, // make first image main by default
          altText: name || file.name.replace(/\.[^/.]+$/, ''),
          status: 'ready',
        });
      }
    });

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the main image, ensure another one is designated main
      if (updated.length > 0 && !updated.some((img) => img.isMain)) {
        updated[0].isMain = true;
      }
      return updated;
    });
  };

  const setMainImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isMain: i === index,
      }))
    );
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Form Validations
    if (!name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (!slug.trim()) {
      setFormError('Product slug is required.');
      return;
    }
    if (!categoryId || !categoryId.trim()) {
      setFormError('Please select a category for this product.');
      return;
    }
    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) {
      setFormError('Please select a valid category from the list.');
      return;
    }
    if (!affiliateUrl.trim()) {
      setFormError('Affiliate store URL is required.');
      return;
    }
    if (!validateAffiliateUrl(affiliateUrl)) {
      setFormError('Affiliate URL must be a valid http:// or https:// web link.');
      return;
    }
    if (images.length === 0) {
      setFormError('Please upload at least one product photograph.');
      return;
    }

    setLoading(true);

    try {
      // Upload pending files to Supabase Storage
      const finalImages: ProductImage[] = [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];

        if (item.file) {
          // Needs upload
          try {
            const uploaded = await uploadProductImage(item.file);
            finalImages.push({
              id: item.id,
              storagePath: uploaded.storagePath,
              publicUrl: uploaded.publicUrl,
              altText: item.altText || name,
              isMain: item.isMain,
              displayOrder: i + 1,
            });
          } catch (uploadErr: any) {
            console.error('Upload error for image:', uploadErr);
            throw new Error(`Failed to upload ${item.file.name}: ${uploadErr.message}`);
          }
        } else {
          // Already uploaded/existing image
          finalImages.push({
            id: item.id,
            storagePath: item.storagePath,
            publicUrl: item.previewUrl,
            altText: item.altText || name,
            isMain: item.isMain,
            displayOrder: i + 1,
          });
        }
      }

      // Ensure at least one is main
      if (finalImages.length > 0 && !finalImages.some((img) => img.isMain)) {
        finalImages[0].isMain = true;
      }

      const parsedCurrentPrice = currentPrice ? parseFloat(currentPrice) : null;
      const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

      const payload = {
        name,
        slug: generateSlug(slug),
        shortDescription,
        description,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        affiliatePlatform,
        affiliateUrl,
        currentPrice: parsedCurrentPrice,
        originalPrice: parsedOriginalPrice,
        isFeatured,
        isTrending,
        isActive,
        images: finalImages,
      };

      if (isEditing && id) {
        await productService.updateProduct(id, payload);
        setFormSuccess('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        setFormSuccess('Product published successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 text-center text-xs text-[#8C7E74]">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D7]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 bg-white border border-[#D8D2C6] rounded-xl hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#1A1816]" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
              {isEditing ? 'Catalog Update' : 'New Product Curation'}
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
              {isEditing ? `Edit: ${name}` : 'Add New Affiliate Product'}
            </h1>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 bg-[#F0F7F2] border border-[#CDE5D4] rounded-xl text-xs text-[#2E7D44] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: General Product Information */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            1. Core Editorial Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Tailored Double-Breasted Wool Overcoat"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-sm text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-[#7A6E65] font-semibold">
                  URL Slug *
                </label>
                <span className="text-[11px] text-[#8C7E74]">Auto-generated from title</span>
              </div>
              <div className="flex items-center bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl px-3 py-2">
                <span className="text-xs text-[#8C7E74] font-mono mr-1">/product/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugCustomized(true);
                  }}
                  className="w-full bg-transparent text-sm text-[#1A1816] font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Short Kicker / Subtitle
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Structured virgin wool blend with horn button fastenings."
                className="w-full px-4 py-2 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            {/* Curated Category Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="product-category-select"
                  className="text-xs uppercase tracking-wider text-[#7A6E65] font-semibold flex items-center gap-1.5"
                >
                  <FolderTree className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>Curated Category *</span>
                </label>
                {!categoriesLoading && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCategory(!showQuickAddCategory)}
                    className="text-[11px] text-[#A67C52] hover:text-[#1A1816] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showQuickAddCategory ? 'Cancel' : 'New Category'}</span>
                  </button>
                )}
              </div>

              {categoriesLoading ? (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#8C7E74]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A67C52]" />
                  <span>Loading categories from database...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoriesError && (
                    <div className="p-3 bg-[#FAF0ED] border border-[#F2C4B8] rounded-xl text-xs text-[#8E3B29] space-y-2">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{categoriesError}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCopySqlSeed}
                          className="px-2.5 py-1 bg-[#1A1816] text-[#F5F2EB] rounded text-[11px] font-semibold hover:bg-[#2E2A26] flex items-center gap-1 transition-colors"
                        >
                          {copiedSqlSeed ? (
                            <>
                              <Check className="w-3 h-3 text-[#A8D5BA]" />
                              <span>SQL Seed Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#D8D2C6]" />
                              <span>Copy Category SQL Seed</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => loadCategories()}
                          className="px-2.5 py-1 bg-white border border-[#D8D2C6] text-[#1A1816] rounded text-[11px] font-semibold hover:bg-[#FAF8F5] transition-colors"
                        >
                          Retry Sync
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <select
                      id="product-category-select"
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-medium text-[#1A1816] focus:outline-none focus:border-[#1A1816] transition-colors appearance-none cursor-pointer pr-10"
                    >
                      <option value="" disabled>
                        -- Select a curated category * --
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#7A6E65]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {isUsingPresets && !categoriesError && (
                    <div className="p-3.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-xs space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#A67C52] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#3A332C] font-semibold">
                            Standard Curated Categories Available
                          </p>
                          <p className="text-[#6B5A4B] leading-relaxed mt-0.5">
                            The 6 standard categories are loaded and ready in the dropdown below. Click &quot;Initialize 6 Standard Categories&quot; to save them directly to your Supabase database, or copy the SQL seed to run in your Supabase SQL Editor.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={seedingCategories}
                          onClick={handleSeedStandardCategories}
                          className="px-3 py-1.5 bg-[#1A1816] text-[#F5F2EB] text-[11px] font-semibold tracking-wider uppercase rounded-lg hover:bg-[#2E2A26] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {seedingCategories ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Syncing to Supabase...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-[#E8DEC8]" />
                              <span>Initialize 6 Standard Categories</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopySqlSeed}
                          className="px-2.5 py-1.5 bg-white border border-[#D8D2C6] text-[#1A1816] rounded-lg text-[11px] font-semibold hover:bg-[#FAF8F5] flex items-center gap-1 transition-colors"
                        >
                          {copiedSqlSeed ? (
                            <>
                              <Check className="w-3 h-3 text-[#388E3C]" />
                              <span>SQL Seed Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#7A6E65]" />
                              <span>Copy Category SQL Seed</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-[#8C7E74]">
                        Curated Categories: Fashion & Accessories, Grooming & Skincare, Tech Gadgets, Lifestyle, Budget Finds, Trending Deals
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Quick Add Category Form */}
              {showQuickAddCategory && (
                <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl space-y-2 animate-fade-in">
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6E65] font-semibold block">
                    Create New Category
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name (e.g. Travel Gear)"
                      className="flex-1 px-3 py-1.5 bg-white border border-[#D8D2C6] rounded-lg text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                    />
                    <button
                      type="button"
                      disabled={quickAddLoading || !newCategoryName.trim()}
                      onClick={handleQuickAddCategory}
                      className="px-3 py-1.5 bg-[#1A1816] text-[#F5F2EB] text-xs font-medium rounded-lg hover:bg-[#2E2A26] transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {quickAddLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Affiliate Retailer */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Affiliate Retailer / Platform *
              </label>
              <input
                type="text"
                required
                value={affiliatePlatform}
                onChange={(e) => setAffiliatePlatform(e.target.value)}
                placeholder="e.g. Amazon, Flipkart, SSENSE, Zara"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-medium text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            {/* Affiliate URL */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Affiliate Outbound Destination URL *
              </label>
              <input
                type="url"
                required
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/B08...?tag=aestheticlook-20"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
              <p className="text-[11px] text-[#8C7E74] mt-1">
                Enter your exact affiliate referral URL. Clicks are logged to Supabase analytics before redirect.
              </p>
            </div>

            {/* Verified Current Price */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Store Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="480.00"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            {/* Verified Original Price (Optional) */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Original Price (For verified discount)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="620.00"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs font-mono text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
              />
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#7A6E65] font-semibold mb-1.5">
                Full Specification & Editorial Review
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details on fabric composition, sizing fit, tactile notes, and craftsmanship..."
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#D8D2C6] rounded-xl text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: CRITICAL Advanced Image Upload System */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE1] gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                2. Direct Device Image Upload (Supabase Storage: product-images)
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5">
                Upload JPG, PNG, or WebP files directly from your computer or phone (max 5 MB each).
              </p>
            </div>
            <span className="text-xs font-mono text-[#8C7E74]">
              {images.length} {images.length === 1 ? 'image' : 'images'} selected
            </span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#1A1816] bg-[#FAF8F5]'
                : 'border-[#D8D2C6] hover:border-[#1A1816] bg-[#FAF8F5]/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-white border border-[#D8D2C6] flex items-center justify-center mx-auto mb-3 text-[#1A1816] shadow-sm">
              <Upload className="w-5 h-5 text-[#7A6E65]" />
            </div>
            <p className="text-sm font-semibold text-[#1A1816]">
              Click to select files or drag photos here
            </p>
            <p className="text-xs text-[#8C7E74] mt-1">
              Supports multiple photos. Maximum 5 MB per file.
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-white border border-[#D8D2C6] text-xs font-semibold text-[#1A1816] rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              Browse Device Files
            </button>
          </div>

          {/* Uploaded Gallery Grid */}
          {images.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wider text-[#7A6E65] font-semibold">
                Uploaded Images — Reorder or Mark Main
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative group bg-[#FAF8F5] rounded-xl overflow-hidden border-2 transition-all p-2 flex flex-col ${
                      img.isMain ? 'border-[#1A1816] shadow-md' : 'border-[#E8E2D7]'
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-white mb-2 relative">
                      <img
                        src={img.previewUrl}
                        alt={img.altText}
                        className="w-full h-full object-cover"
                      />

                      {/* Main Image Badge */}
                      {img.isMain && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#1A1816] text-[#E4A853] text-[9px] font-bold uppercase tracking-wider rounded shadow">
                          Main Photo
                        </span>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image controls: Set main & Reorder left/right */}
                    <div className="mt-auto space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setMainImage(idx)}
                        className={`w-full py-1 text-[10px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                          img.isMain
                            ? 'bg-[#1A1816] text-white'
                            : 'bg-white border border-[#D8D2C6] text-[#5A5047] hover:text-[#1A1816]'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${img.isMain ? 'fill-current' : ''}`} />
                        <span>{img.isMain ? 'Main Photo' : 'Set as Main'}</span>
                      </button>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'left')}
                          className="flex-1 py-0.5 bg-white border border-[#D8D2C6] rounded text-[10px] text-[#7A6E65] hover:text-[#1A1816] disabled:opacity-30 flex items-center justify-center"
                          title="Move earlier"
                        >
                          <MoveLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => moveImage(idx, 'right')}
                          className="flex-1 py-0.5 bg-white border border-[#D8D2C6] rounded text-[10px] text-[#7A6E65] hover:text-[#1A1816] disabled:opacity-30 flex items-center justify-center"
                          title="Move later"
                        >
                          <MoveRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Publishing Flags */}
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1A1816] pb-3 border-b border-[#F0EAE1]">
            3. Publication & Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#D8D2C6] hover:bg-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A1816] border-[#D8D2C6] focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-[#1A1816] block">Active Listing</span>
                <span className="text-[10px] text-[#8C7E74]">Visible on public store</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#D8D2C6] hover:bg-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A1816] border-[#D8D2C6] focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-[#1A1816] block">Editor’s Pick</span>
                <span className="text-[10px] text-[#8C7E74]">Showcase on homepage</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#D8D2C6] hover:bg-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A1816] border-[#D8D2C6] focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-[#1A1816] block">Trending Item</span>
                <span className="text-[10px] text-[#8C7E74]">High engagement badge</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-[#D8D2C6] rounded-xl text-xs font-semibold text-[#5A5047] hover:bg-[#FAF8F5] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing to Database...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Product Changes' : 'Publish Product'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
