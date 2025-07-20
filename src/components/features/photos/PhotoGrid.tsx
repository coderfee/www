import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhotoData, PhotoCategory } from '@/types/photos';
import PhotoLightbox from './PhotoLightbox';
import { ImagePerformanceMonitor, getImageLoadingStrategy } from '@/utils/imageLoadingStrategy';
import { 
  ErrorType, 
  ImageErrorHandler, 
  networkMonitor, 
  handleError 
} from '@/utils/errorHandling';

interface PhotoGridProps {
  photos: PhotoData[];
  categories: PhotoCategory[];
}

interface PhotoCardProps {
  photo: PhotoData;
  index: number;
  onClick: (index: number) => void;
}

// 骨架屏组件
const PhotoSkeleton: React.FC = () => (
  <div className="photo-skeleton animate-pulse">
    <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16"></div>
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// 错误占位图组件
const ErrorPlaceholder: React.FC<{ 
  alt: string; 
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}> = ({ alt, onRetry, retryCount = 0, maxRetries = 3 }) => (
  <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
    <div className="text-center p-4">
      <svg 
        className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">图片加载失败</p>
      {onRetry && retryCount < maxRetries && (
        <button
          onClick={onRetry}
          className="text-xs bg-violet-500 hover:bg-violet-600 text-white px-2 py-1 rounded transition-colors duration-200"
          aria-label={`重试加载图片: ${alt}`}
        >
          重试 ({retryCount + 1}/{maxRetries})
        </button>
      )}
      {retryCount >= maxRetries && (
        <p className="text-xs text-red-500 dark:text-red-400">
          多次重试失败
        </p>
      )}
    </div>
  </div>
);

// 单个照片卡片组件
const PhotoCard: React.FC<PhotoCardProps> = ({ photo, index, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<'webp' | 'avif' | 'jpeg'>('webp');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;

  // 获取加载策略
  const loadingStrategy = getImageLoadingStrategy(index, index < 6);

  // 获取优化后的图片 URL
  const getOptimizedImageUrl = useCallback(() => {
    // 优先使用优化后的格式
    if (photo.formats) {
      if (currentFormat === 'avif' && photo.formats.avif) {
        return photo.formats.avif;
      }
      if (currentFormat === 'webp' && photo.formats.webp) {
        return photo.formats.webp;
      }
      if (photo.formats.jpeg) {
        return photo.formats.jpeg;
      }
    }
    
    // 后备到原始图片
    return photo.thumbnail || photo.image;
  }, [photo.formats, photo.thumbnail, photo.image, currentFormat]);

  // 检测浏览器支持的图片格式
  useEffect(() => {
    const detectFormat = async () => {
      // 检查 AVIF 支持
      const avifSupported = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });

      // 检查 WebP 支持
      const webpSupported = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });

      if (avifSupported) {
        setCurrentFormat('avif');
      } else if (webpSupported) {
        setCurrentFormat('webp');
      } else {
        setCurrentFormat('jpeg');
      }
    };

    detectFormat();
  }, []);

  // Intersection Observer for lazy loading with improved settings
  useEffect(() => {
    if (loadingStrategy.loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // 增加预加载距离
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [loadingStrategy.loading]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    
    // 记录性能
    const monitor = ImagePerformanceMonitor.getInstance();
    monitor.endLoad(photo.id);
  }, [photo.id]);

  const handleImageError = useCallback(() => {
    const imageUrl = getOptimizedImageUrl();
    
    // 如果当前格式加载失败，尝试降级到下一个格式
    if (currentFormat === 'avif') {
      setCurrentFormat('webp');
      ImageErrorHandler.resetRetryCount(imageUrl);
      handleError(`Image format fallback from AVIF to WebP: ${imageUrl}`, ErrorType.IMAGE_LOAD_ERROR);
    } else if (currentFormat === 'webp') {
      setCurrentFormat('jpeg');
      ImageErrorHandler.resetRetryCount(imageUrl);
      handleError(`Image format fallback from WebP to JPEG: ${imageUrl}`, ErrorType.IMAGE_LOAD_ERROR);
    } else {
      // 所有格式都失败了，使用错误处理器
      const shouldRetry = ImageErrorHandler.handleImageError(
        imageUrl,
        () => handleRetry(),
        () => {
          setHasError(true);
          setIsLoaded(false);
          setIsRetrying(false);
        }
      );
      
      if (!shouldRetry) {
        setHasError(true);
        setIsLoaded(false);
        setIsRetrying(false);
      }
      
      // 记录错误
      const monitor = ImagePerformanceMonitor.getInstance();
      monitor.recordError(photo.id);
    }
  }, [currentFormat, photo.id, getOptimizedImageUrl]);

  // 重试加载图片
  const handleRetry = useCallback(() => {
    const imageUrl = getOptimizedImageUrl();
    const currentRetryCount = ImageErrorHandler.getRetryCount(imageUrl);
    
    if (currentRetryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setHasError(false);
    setRetryCount(currentRetryCount);
    
    // 延迟重试，避免立即重复请求
    setTimeout(() => {
      if (imgRef.current) {
        const currentSrc = imgRef.current.src;
        imgRef.current.src = '';
        // 添加时间戳避免缓存
        imgRef.current.src = `${currentSrc}?retry=${currentRetryCount + 1}&t=${Date.now()}`;
      }
      setIsRetrying(false);
    }, 1000 * (currentRetryCount + 1)); // 递增延迟
  }, [maxRetries, getOptimizedImageUrl]);

  const handleCardClick = useCallback(() => {
    if (isLoaded && !hasError) {
      onClick(index);
    }
  }, [isLoaded, hasError, onClick, index]);

  // 开始加载监控
  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      const monitor = ImagePerformanceMonitor.getInstance();
      monitor.startLoad(photo.id);
    }
  }, [isInView, isLoaded, hasError, photo.id]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: Math.min(index * 0.05, 1), // 限制最大延迟
        ease: "easeOut"
      }}
      className="photo-card group relative overflow-hidden rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer touch-manipulation"
      onClick={handleCardClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}
    >
      {/* 照片容器 */}
      <div className="aspect-square overflow-hidden relative">
        {!isInView ? (
          <PhotoSkeleton />
        ) : hasError ? (
          <ErrorPlaceholder 
            alt={photo.alt} 
            onRetry={handleRetry}
            retryCount={ImageErrorHandler.getRetryCount(getOptimizedImageUrl())}
            maxRetries={maxRetries}
          />
        ) : isRetrying ? (
          <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">重试中...</p>
            </div>
          </div>
        ) : (
          <>
            {!isLoaded && <PhotoSkeleton />}
            <picture>
              {/* 提供多种格式支持 */}
              {currentFormat === 'avif' && photo.formats?.avif && (
                <source 
                  srcSet={photo.formats.avif} 
                  type="image/avif"
                />
              )}
              {(currentFormat === 'webp' || currentFormat === 'avif') && photo.formats?.webp && (
                <source 
                  srcSet={photo.formats.webp} 
                  type="image/webp"
                />
              )}
              <img
                ref={imgRef}
                src={getOptimizedImageUrl()}
                alt={photo.alt}
                width={400}
                height={400}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading={loadingStrategy.loading}
                decoding={loadingStrategy.decoding}
                fetchPriority={loadingStrategy.fetchPriority}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                style={{ 
                  imageRendering: '-webkit-optimize-contrast',
                  contentVisibility: 'auto'
                }}
              />
            </picture>
          </>
        )}
        
        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
              />
            </svg>
          </motion.div>
        </div>
      </div>
      
      {/* 照片信息 */}
      <div className="p-2 sm:p-3 lg:p-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 text-xs sm:text-sm lg:text-base line-clamp-1">
          {photo.title}
        </h3>
        {photo.description && (
          <p className="text-xs sm:text-xs lg:text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
            {photo.description}
          </p>
        )}
        
        {/* 元数据 */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
          <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">
            {photo.category}
          </span>
          <time dateTime={photo.date.toISOString()} className="text-xs">
            {photo.date.toLocaleDateString('zh-CN')}
          </time>
        </div>
      </div>
    </motion.div>
  );
};

// 主要的 PhotoGrid 组件
const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoData[]>(photos);
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [networkError, setNetworkError] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // 灯箱状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 预加载关键图片
  useEffect(() => {
    const preloadCriticalImages = async () => {
      // 预加载前6张图片
      const criticalPhotos = filteredPhotos.slice(0, 6);
      
      criticalPhotos.forEach((photo, index) => {
        if (!preloadedImages.has(photo.id)) {
          const img = new Image();
          const imageUrl = photo.formats?.webp || photo.thumbnail || photo.image;
          
          img.src = imageUrl;
          img.loading = 'eager';
          
          img.onload = () => {
            setPreloadedImages(prev => new Set(prev).add(photo.id));
          };
        }
      });
    };

    if (filteredPhotos.length > 0) {
      preloadCriticalImages();
    }
  }, [filteredPhotos, preloadedImages]);

  // 分类筛选
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      if (selectedCategory === 'all') {
        setFilteredPhotos(photos);
      } else {
        // 通过分类ID或分类名称进行筛选
        const filtered = photos.filter(photo => {
          const categoryId = photo.category.toLowerCase().replace(/\s+/g, '-');
          return categoryId === selectedCategory || photo.category === selectedCategory;
        });
        setFilteredPhotos(filtered);
      }
      setIsLoading(false);
    }, 300); // 添加轻微延迟以显示加载状态

    return () => clearTimeout(timer);
  }, [selectedCategory, photos]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handlePhotoClick = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  // 灯箱控制函数
  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleLightboxNext = useCallback(() => {
    setCurrentPhotoIndex((prev) => 
      prev < filteredPhotos.length - 1 ? prev + 1 : prev
    );
  }, [filteredPhotos.length]);

  const handleLightboxPrev = useCallback(() => {
    setCurrentPhotoIndex((prev) => prev > 0 ? prev - 1 : prev);
  }, []);

  // 性能监控
  useEffect(() => {
    // 监控图片加载性能
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('photos') && entry.entryType === 'resource') {
          console.log(`Image loaded: ${entry.name}, Duration: ${entry.duration}ms`);
        }
      });
    });

    if ('PerformanceObserver' in window) {
      observer.observe({ entryTypes: ['resource'] });
    }

    return () => {
      if ('PerformanceObserver' in window) {
        observer.disconnect();
      }
    };
  }, []);

  // 内存管理 - 清理未使用的图片
  useEffect(() => {
    const cleanupImages = () => {
      // 获取所有图片元素
      const images = document.querySelectorAll('.photo-card img');
      
      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        const rect = imgElement.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
        
        if (!isVisible && imgElement.src && !imgElement.src.startsWith('data:')) {
          // 对于不可见的图片，可以考虑释放资源
          // 这里我们保持简单，只是标记
          imgElement.setAttribute('data-offscreen', 'true');
        } else {
          imgElement.removeAttribute('data-offscreen');
        }
      });
    };

    const throttledCleanup = throttle(cleanupImages, 1000);
    window.addEventListener('scroll', throttledCleanup);
    window.addEventListener('resize', throttledCleanup);

    return () => {
      window.removeEventListener('scroll', throttledCleanup);
      window.removeEventListener('resize', throttledCleanup);
    };
  }, [filteredPhotos]);

  // 节流函数
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // 网络状态监听
  useEffect(() => {
    const handleNetworkChange = (isOnline: boolean) => {
      setIsOnline(isOnline);
      setNetworkError(!isOnline);
      
      if (isOnline) {
        // 网络恢复时，清除所有图片重试计数，允许重新加载
        ImageErrorHandler.clearAllRetryCounts();
      }
    };

    // 使用网络监控器
    networkMonitor.addListener(handleNetworkChange);
    
    // 获取初始网络状态
    const { isOnline: initialOnline } = networkMonitor.getNetworkStatus();
    setIsOnline(initialOnline);
    setNetworkError(!initialOnline);

    return () => {
      networkMonitor.removeListener(handleNetworkChange);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* 网络状态提示 */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">网络连接已断开</span>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            部分图片可能无法正常加载，请检查网络连接后刷新页面
          </p>
        </motion.div>
      )}

      {/* 照片统计信息 */}
      <div className="flex justify-center items-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
          <span>
            {selectedCategory === 'all' ? photos.length : filteredPhotos.length} 张照片
            {selectedCategory !== 'all' && (
              <span className="text-xs ml-1">
                (共 {photos.length} 张)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>{categories.length} 个分类</span>
        </div>
        {selectedCategory !== 'all' && (
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
            <span className="text-xs">
              筛选: {categories.find(cat => cat.id === selectedCategory)?.name}
            </span>
          </div>
        )}
      </div>

      {/* 分类筛选器 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 lg:gap-3 px-2 sm:px-0">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
              selectedCategory === 'all'
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                : 'bg-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300'
            }`}
          >
            <span>全部</span>
            <span className={`text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
              selectedCategory === 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
            }`}>
              {photos.length}
            </span>
          </button>
          {categories.map((category) => {
            const categoryPhotoCount = photos.filter(photo => {
              const categoryId = photo.category.toLowerCase().replace(/\s+/g, '-');
              return categoryId === category.id || photo.category === category.name;
            }).length;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                  selectedCategory === category.id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300'
                }`}
              >
                <span>{category.name}</span>
                <span className={`text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {categoryPhotoCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 照片网格主容器 */}
      <main className="photo-gallery-container">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="photo-grid-responsive grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <PhotoSkeleton key={index} />
              ))}
            </motion.div>
          ) : filteredPhotos.length > 0 ? (
            <motion.div
              key="photos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="photo-grid-responsive grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onClick={handlePhotoClick}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="empty-state text-center py-16 px-4"
            >
              <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {selectedCategory === 'all' ? '暂无照片' : '该分类暂无照片'}
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-400 text-sm lg:text-base mb-6 max-w-md mx-auto">
                {selectedCategory === 'all' 
                  ? '照片库正在建设中，敬请期待精彩内容。您可以稍后再来查看，或者联系管理员了解更多信息。' 
                  : `"${categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}" 分类下暂无照片。试试其他分类或查看全部照片。`
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full text-sm font-medium transition-colors duration-200 shadow-lg shadow-violet-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    查看全部照片
                  </button>
                )}
                
                {selectedCategory === 'all' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    刷新页面
                  </button>
                )}
                
                {/* 提供其他有用的链接 */}
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full text-sm font-medium transition-colors duration-200 border border-zinc-200 dark:border-zinc-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  返回首页
                </a>
              </div>
              
              {/* 额外的帮助信息 */}
              {selectedCategory !== 'all' && categories.length > 1 && (
                <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    或者尝试其他分类：
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories
                      .filter(cat => cat.id !== selectedCategory)
                      .slice(0, 4)
                      .map(category => {
                        const categoryPhotoCount = photos.filter(photo => {
                          const categoryId = photo.category.toLowerCase().replace(/\s+/g, '-');
                          return categoryId === category.id || photo.category === category.name;
                        }).length;
                        
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className="text-xs px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors duration-200"
                          >
                            {category.name} ({categoryPhotoCount})
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 灯箱组件 */}
      <PhotoLightbox
        photos={filteredPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={handleLightboxClose}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />
    </div>
  );
};

export default PhotoGrid;