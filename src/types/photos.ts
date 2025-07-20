export interface PhotoData {
  id: string;
  title: string;
  description?: string;
  image: string;
  thumbnail?: string;
  category: string;
  tags?: string[];
  date: Date;
  alt: string;
  width?: number;
  height?: number;
  // 新增优化相关字段
  formats?: {
    webp?: string;
    avif?: string;
    jpeg?: string;
  };
  sizes?: {
    thumbnail?: { width: number; height: number };
    medium?: { width: number; height: number };
    large?: { width: number; height: number };
  };
  quality?: number;
  priority?: boolean;
}

export interface PhotoCategory {
  id: string;
  name: string;
  description?: string;
  cover?: string;
}

export interface PhotoGridProps {
  photos: PhotoData[];
  categories: PhotoCategory[];
}

export interface PhotoLightboxProps {
  photos: PhotoData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}