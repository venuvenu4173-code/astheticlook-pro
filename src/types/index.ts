export interface ProductImage {
  id: string;
  productId?: string;
  storagePath: string;
  publicUrl: string;
  altText?: string;
  isMain: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  affiliatePlatform: string;
  affiliateUrl: string;
  currentPrice: number | null;
  originalPrice: number | null;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imagePath?: string;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt?: string;
}

export interface AffiliateClick {
  id: string;
  productId: string;
  productName?: string;
  clickedAt: string;
  affiliatePlatform: string;
  referrerDomain?: string | null;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  logoUrl: string;
  instagramUrl: string;
  announcementText: string;
  announcementEnabled: boolean;
  footerDescription: string;
  contactEmail: string;
  affiliateDisclosure: string;
}

export interface AffiliatePlatform {
  id: string;
  name: string;
  tag: string;
  iconName?: string;
  isActive: boolean;
}
