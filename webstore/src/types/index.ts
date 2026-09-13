export type PricingType = "Free" | "Freemium" | "Paid" | "Open Source" | "Free Trial";
export type ProductStatus = "draft" | "published" | "archived";

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  photoURL?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  socialLinks?: { label: string; url: string }[];
  education?: string;
  experience?: string;
  skills: string[];
  interests?: string[];
  productCount: number;
  totalViews: number;
  totalClicks: number;
  avgRating: number;
  createdAt: number;
  isSeed?: boolean;
}

export interface Product {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  ownerAvatar?: string;
  name: string;
  slug: string;
  logoUrl?: string;
  tagline: string;
  description: string;
  problemSolved?: string;
  features: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  technologies: string[];
  websiteUrl: string;
  githubUrl?: string;
  docsUrl?: string;
  screenshots: string[];
  promoImageUrl?: string;
  demoVideoUrl?: string;
  pricingType: PricingType;
  targetAudience?: string;
  version?: string;
  status: ProductStatus;
  launchDate: number;
  createdAt: number;
  updatedAt: number;
  views: number;
  clicks: number;
  ratingAvg: number;
  ratingCount: number;
  reviewCount: number;
  featured?: boolean;
  ratingDistribution?: Record<"1" | "2" | "3" | "4" | "5", number>;
  isSeed?: boolean;
}

export interface Rating {
  id: string;
  productId: string;
  userId: string;
  value: number;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  productId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  productId: string;
  createdAt: number;
}

export interface Report {
  id: string;
  targetType: "product" | "review" | "profile";
  targetId: string;
  reporterId: string;
  reason: string;
  details?: string;
  createdAt: number;
}

export interface DailyStat {
  id: string;
  views: number;
  clicks: number;
  date: string;
}
