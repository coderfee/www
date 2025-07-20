import type { CollectionEntry } from 'astro:content';
import type { PhotoData, PhotoCategory } from '@/types/photos';
import { generateOptimizedImage, generateMultiFormatImages, IMAGE_SIZES } from './imageOptimization';

export function transformPhotoData(entry: CollectionEntry<'photos'>): PhotoData {
  return {
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    image: typeof entry.data.image === 'string' ? entry.data.image : entry.data.image.src,
    thumbnail: typeof entry.data.thumbnail === 'string' ? entry.data.thumbnail : entry.data.thumbnail?.src,
    category: entry.data.category,
    tags: entry.data.tags,
    date: entry.data.date,
    alt: entry.data.alt,
    width: entry.data.width,
    height: entry.data.height,
  };
}

/**
 * 为照片数据生成优化的图片版本
 */
export async function enhancePhotoWithOptimizedImages(photo: PhotoData, imageModule: any) {
  try {
    // 生成缩略图（如果没有提供）
    const thumbnail = photo.thumbnail 
      ? await generateOptimizedImage(imageModule, 'thumbnail')
      : await generateOptimizedImage(imageModule, 'thumbnail');

    // 生成中等尺寸图片
    const medium = await generateOptimizedImage(imageModule, 'medium');

    // 生成大尺寸图片（用于灯箱）
    const large = await generateOptimizedImage(imageModule, 'lightbox');

    // 生成多格式版本
    const multiFormat = await generateMultiFormatImages(imageModule, 'thumbnail');

    return {
      ...photo,
      optimized: {
        thumbnail: thumbnail.src,
        medium: medium.src,
        large: large.src,
        formats: multiFormat,
      },
      dimensions: {
        thumbnail: IMAGE_SIZES.thumbnail,
        medium: IMAGE_SIZES.medium,
        large: IMAGE_SIZES.lightbox,
      },
    };
  } catch (error) {
    console.error(`Failed to enhance photo ${photo.id}:`, error);
    // 返回原始数据作为后备
    return photo;
  }
}

export function extractCategories(photos: PhotoData[]): PhotoCategory[] {
  const categoryMap = new Map<string, PhotoCategory>();
  
  photos.forEach(photo => {
    if (!categoryMap.has(photo.category)) {
      categoryMap.set(photo.category, {
        id: photo.category.toLowerCase().replace(/\s+/g, '-'),
        name: photo.category,
        cover: photo.image, // 使用第一张照片作为分类封面
      });
    }
  });
  
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function filterPhotosByCategory(photos: PhotoData[], categoryId: string): PhotoData[] {
  if (categoryId === 'all') {
    return photos;
  }
  
  return photos.filter(photo => 
    photo.category.toLowerCase().replace(/\s+/g, '-') === categoryId
  );
}

export function sortPhotosByDate(photos: PhotoData[], order: 'asc' | 'desc' = 'desc'): PhotoData[] {
  return [...photos].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}