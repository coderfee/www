/**
 * 图片加载策略工具
 */

// 图片加载优先级
export enum ImagePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

// 图片加载策略配置
export interface LoadingStrategy {
  priority: ImagePriority;
  loading: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'sync' | 'async' | 'auto';
  preload?: boolean;
}

/**
 * 根据图片位置和重要性确定加载策略
 */
export function getImageLoadingStrategy(
  index: number,
  isAboveFold: boolean = false,
  isHero: boolean = false
): LoadingStrategy {
  // 英雄图片或首屏图片
  if (isHero || (isAboveFold && index < 3)) {
    return {
      priority: ImagePriority.HIGH,
      loading: 'eager',
      fetchPriority: 'high',
      decoding: 'sync',
      preload: true,
    };
  }

  // 首屏可见的图片
  if (index < 6) {
    return {
      priority: ImagePriority.NORMAL,
      loading: 'eager',
      fetchPriority: 'auto',
      decoding: 'async',
      preload: false,
    };
  }

  // 其他图片使用懒加载
  return {
    priority: ImagePriority.LOW,
    loading: 'lazy',
    fetchPriority: 'low',
    decoding: 'async',
    preload: false,
  };
}

/**
 * 预加载关键图片
 */
export function preloadCriticalImages(imageUrls: string[], formats: string[] = ['webp', 'avif']) {
  if (typeof window === 'undefined') return;

  imageUrls.forEach((url, index) => {
    // 只预加载前3张图片
    if (index >= 3) return;

    formats.forEach((format) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.type = `image/${format}`;
      
      // 添加到文档头部
      document.head.appendChild(link);
    });
  });
}

/**
 * 图片性能监控
 */
export class ImagePerformanceMonitor {
  private static instance: ImagePerformanceMonitor;
  private loadTimes: Map<string, number> = new Map();
  private errorCount: number = 0;
  private totalImages: number = 0;

  static getInstance(): ImagePerformanceMonitor {
    if (!ImagePerformanceMonitor.instance) {
      ImagePerformanceMonitor.instance = new ImagePerformanceMonitor();
    }
    return ImagePerformanceMonitor.instance;
  }

  /**
   * 记录图片加载开始
   */
  startLoad(imageId: string): void {
    this.loadTimes.set(imageId, performance.now());
    this.totalImages++;
  }

  /**
   * 记录图片加载完成
   */
  endLoad(imageId: string): void {
    const startTime = this.loadTimes.get(imageId);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      console.log(`Image ${imageId} loaded in ${loadTime.toFixed(2)}ms`);
      this.loadTimes.delete(imageId);
    }
  }

  /**
   * 记录图片加载错误
   */
  recordError(imageId: string): void {
    this.errorCount++;
    console.warn(`Image ${imageId} failed to load. Total errors: ${this.errorCount}`);
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    totalImages: number;
    errorCount: number;
    errorRate: number;
    pendingLoads: number;
  } {
    return {
      totalImages: this.totalImages,
      errorCount: this.errorCount,
      errorRate: this.totalImages > 0 ? (this.errorCount / this.totalImages) * 100 : 0,
      pendingLoads: this.loadTimes.size,
    };
  }
}

/**
 * 图片懒加载观察器
 */
export class LazyImageObserver {
  private observer: IntersectionObserver | null = null;
  private imageElements: Set<HTMLImageElement> = new Set();

  constructor(options?: IntersectionObserverInit) {
    if (typeof window === 'undefined') return;

    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { ...defaultOptions, ...options }
    );
  }

  /**
   * 观察图片元素
   */
  observe(element: HTMLImageElement): void {
    if (!this.observer) return;

    this.imageElements.add(element);
    this.observer.observe(element);
  }

  /**
   * 停止观察图片元素
   */
  unobserve(element: HTMLImageElement): void {
    if (!this.observer) return;

    this.imageElements.delete(element);
    this.observer.unobserve(element);
  }

  /**
   * 处理交叉观察
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.getAttribute('data-src');
        
        if (dataSrc && !img.src) {
          const monitor = ImagePerformanceMonitor.getInstance();
          const imageId = img.getAttribute('data-image-id') || dataSrc;
          
          monitor.startLoad(imageId);
          
          img.src = dataSrc;
          img.onload = () => {
            monitor.endLoad(imageId);
            img.classList.add('loaded');
          };
          img.onerror = () => {
            monitor.recordError(imageId);
            img.classList.add('error');
          };
          
          this.unobserve(img);
        }
      }
    });
  }

  /**
   * 销毁观察器
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.imageElements.clear();
  }
}

/**
 * 检测网络连接质量
 */
export function getNetworkQuality(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  
  if (!connection) return 'unknown';

  // 根据有效连接类型判断网络质量
  const effectiveType = connection.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g' || effectiveType === '4g') {
    return 'fast';
  }
  
  return 'unknown';
}

/**
 * 根据网络质量调整图片质量
 */
export function getOptimalImageQuality(baseQuality: number = 85): number {
  const networkQuality = getNetworkQuality();
  
  switch (networkQuality) {
    case 'slow':
      return Math.max(baseQuality - 20, 60); // 降低质量以提高加载速度
    case 'fast':
      return Math.min(baseQuality + 10, 95); // 提高质量以获得更好的视觉效果
    default:
      return baseQuality;
  }
}

/**
 * 生成响应式图片的 srcset
 */
export function generateResponsiveSrcSet(
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600],
  format: string = 'webp'
): string {
  return sizes
    .map((size) => {
      const params = new URLSearchParams({
        w: size.toString(),
        h: size.toString(),
        fit: 'cover',
        f: format,
        q: getOptimalImageQuality().toString(),
      });
      
      return `${baseUrl}?${params.toString()} ${size}w`;
    })
    .join(', ');
}

/**
 * 生成 sizes 属性
 */
export function generateSizesAttribute(breakpoints?: Record<string, string>): string {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '50vw',
    '(max-width: 1024px)': '33vw',
    '(max-width: 1280px)': '25vw',
    'default': '20vw',
  };

  const sizes = breakpoints || defaultBreakpoints;
  const sizeEntries = Object.entries(sizes)
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`);

  sizeEntries.push(sizes.default || '20vw');
  return sizeEntries.join(', ');
}