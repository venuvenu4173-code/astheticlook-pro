import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Copy, Check, Trash2, ExternalLink, HardDrive } from 'lucide-react';
import { productService } from '../../services/productService';
import { uploadProductImage, BUCKET_NAME } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ProductImage } from '../../types';

export const AdminImageLibrary: React.FC = () => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    productService.getProducts({ onlyActive: false }).then((prods) => {
      const allImgs: ProductImage[] = [];
      for (const p of prods) {
        if (p.images) {
          allImgs.push(...p.images);
        }
      }
      setImages(allImgs);
    });
  }, []);

  const handleCopyUrl = (url: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleStandaloneUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadProductImage(file);
      setImages((prev) => [
        {
          id: `img-standalone-${Date.now()}`,
          storagePath: res.storagePath,
          publicUrl: res.publicUrl,
          altText: file.name,
          isMain: false,
          displayOrder: 99,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D7]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C7E74] font-semibold">
            Supabase Storage
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1816] mt-0.5">
            Media & Image Library
          </h1>
          <p className="text-xs text-[#7A6E65] mt-1">
            Bucket: <strong className="font-mono text-[#1A1816]">{BUCKET_NAME}</strong> · Direct device uploads with public read URLs.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleStandaloneUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1816] hover:bg-[#2C2622] text-[#FAF8F5] rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading to Bucket...' : 'Upload Direct Photo'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-white border border-[#E8E2D7] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#1A1816] transition-all"
            >
              <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden">
                <img
                  src={img.publicUrl}
                  alt={img.altText || 'Media item'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              </div>

              <div className="p-3 bg-white space-y-2">
                <p className="font-mono text-[10px] text-[#8C7E74] truncate" title={img.storagePath}>
                  {img.storagePath || 'Uploaded media'}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1]">
                  <a
                    href={img.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#8C7E74] hover:text-[#1A1816]"
                    title="Open original public URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleCopyUrl(img.publicUrl, img.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1A1816] px-2 py-1 bg-[#FAF8F5] hover:bg-[#F2ECE3] rounded transition-colors"
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#2E7D44]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D7] rounded-2xl p-16 text-center">
          <HardDrive className="w-10 h-10 text-[#A69B91] mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#1A1816]">No images uploaded yet</h3>
          <p className="text-xs text-[#7A6E65] mt-1">
            Product photos uploaded via the Add Product screen will appear in this centralized library.
          </p>
        </div>
      )}
    </div>
  );
};
