import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// 图片优化配置
export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 },
  lightbox: { width: 1920, height: 1080 },
} as const;

// 支持的图片格式
export const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png'] as const;

// 图片质量设置
export const IMAGE_QUALITY = {
  thumbnail: 75,
  medium: 85,
  large: 90,
  lightbox: 95,
} as const;

/**
 * 生成优化后的图片
 */
export async function generateOptimizedImage(
  src: ImageMetadata,
  size: keyof typeof IMAGE_SIZES,
  format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp'
) {
  const { width, height } = IMAGE_SIZES[size];
  const quality = IMAGE_QUALITY[size];

  try {
    const optimizedImage = await getImage({
      src,
      width,
      height,
      format,
      quality,
      fit: 'cover',
      position: 'center',
    });

    return optimizedImage;
  } catch (error) {
    console.error(`Failed to optimize image for size ${size}:`, error);
    // 返回原始图片作为后备
    return {
      src: src.src,
      width: src.width,
      height: src.height,
    };
  }
}

/**
 * 生成多种格式的图片
 */
export async function generateMultiFormatImages(
  src: ImageMetadata,
  size: keyof typeof IMAGE_SIZES
) {
  const formats: Array<'webp' | 'avif' | 'jpeg'> = ['webp', 'avif', 'jpeg'];
  const images: Record<string, any> = {};

  for (const format of formats) {
    try {
      images[format] = await generateOptimizedImage(src, size, format);
    } catch (error) {
      console.warn(`Failed to generate ${format} format for ${size}:`, error);
    }
  }

  return images;
}

/**
 * 生成响应式图片的 srcset
 */
export async function generateResponsiveSrcSet(
  src: ImageMetadata,
  sizes: Array<keyof typeof IMAGE_SIZES> = ['thumbnail', 'medium', 'large']
) {
  const srcSetEntries: string[] = [];

  for (const size of sizes) {
    try {
      const optimized = await generateOptimizedImage(src, size);
      const { width } = IMAGE_SIZES[size];
      srcSetEntries.push(`${optimized.src} ${width}w`);
    } catch (error) {
      console.warn(`Failed to generate responsive image for size ${size}:`, error);
    }
  }

  return srcSetEntries.join(', ');
}

/**
 * 获取图片的元数据
 */
export function getImageMetadata(src: ImageMetadata) {
  return {
    width: src.width,
    height: src.height,
    format: src.format,
    src: src.src,
  };
}

/**
 * 计算图片的宽高比
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * 生成图片的 sizes 属性
 */
export function generateSizesAttribute(breakpoints?: Record<string, string>): string {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '50vw',
    '(max-width: 1024px)': '33vw',
    '(max-width: 1280px)': '25vw',
    default: '20vw',
  };

  const sizes = breakpoints || defaultBreakpoints;
  const sizeEntries = Object.entries(sizes)
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`);

  sizeEntries.push(sizes.default || '20vw');
  return sizeEntries.join(', ');
}

/**
 * 预加载关键图片
 */
export function generatePreloadLinks(images: Array<{ src: string; format?: string }>) {
  return images.map(({ src, format = 'webp' }) => ({
    rel: 'preload',
    as: 'image',
    href: src,
    type: `image/${format}`,
  }));
}

/**
 * 检查浏览器是否支持特定图片格式
 */
export function getBrowserSupportedFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') {
    return 'webp'; // 服务端默认返回 webp
  }

  // 检查 AVIF 支持
  const avifCanvas = document.createElement('canvas');
  avifCanvas.width = 1;
  avifCanvas.height = 1;
  const avifSupported = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;

  if (avifSupported) {
    return 'avif';
  }

  // 检查 WebP 支持
  const webpCanvas = document.createElement('canvas');
  webpCanvas.width = 1;
  webpCanvas.height = 1;
  const webpSupported = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

  if (webpSupported) {
    return 'webp';
  }

  return 'jpeg';
}