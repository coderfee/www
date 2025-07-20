import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { PhotoLightboxProps } from '@/types/photos';

// Define PanInfo type locally since it might not be exported in this version
interface PanInfo {
  offset: { x: number; y: number };
  delta: { x: number; y: number };
  velocity: { x: number; y: number };
  point: { x: number; y: number };
}

// 动画变体定义
const backdropVariants: Variants = {
  hidden: { 
    opacity: 0,
    backdropFilter: 'blur(0px)'
  },
  visible: { 
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const containerVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 30,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const imageVariants: Variants = {
  hidden: (direction: string | null) => ({
    opacity: 0,
    scale: 0.95,
    filter: 'blur(4px)',
    x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0
  }),
  visible: { 
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: (direction: string | null) => ({
    opacity: 0,
    scale: 1.05,
    filter: 'blur(2px)',
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

const controlVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const infoVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}) => {
  const lightboxRef = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[currentIndex];
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [currentImageLoading, setCurrentImageLoading] = useState(false);
  const [imageDirection, setImageDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // 增强的导航函数，带方向追踪
  const handleNext = useCallback(() => {
    setImageDirection('right');
    onNext();
  }, [onNext]);

  const handlePrev = useCallback(() => {
    setImageDirection('left');
    onPrev();
  }, [onPrev]);

  // 重置方向状态
  useEffect(() => {
    if (imageDirection) {
      const timer = setTimeout(() => setImageDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [imageDirection]);

  // 图片预加载功能 - 使用优化后的图片
  const preloadImage = useCallback((photo: any) => {
    const lightboxSrc = photo.formats?.webp?.replace('thumbnail', 'lightbox') || photo.image;
    
    if (preloadedImages.has(lightboxSrc)) return;
    
    const img = new Image();
    img.onload = () => {
      setPreloadedImages(prev => new Set(prev).add(lightboxSrc));
      // 如果是当前图片加载完成，更新加载状态
      if (currentPhoto?.id === photo.id) {
        setCurrentImageLoading(false);
      }
    };
    img.onerror = () => {
      console.warn(`Failed to preload image: ${lightboxSrc}`);
      // 如果是当前图片加载失败，也要更新加载状态
      if (currentPhoto?.id === photo.id) {
        setCurrentImageLoading(false);
      }
    };
    img.src = lightboxSrc;
  }, [preloadedImages, currentPhoto?.id]);

  // 预加载相邻图片
  useEffect(() => {
    if (!isOpen || photos.length === 0) return;

    const currentLightboxSrc = currentPhoto?.formats?.webp?.replace('thumbnail', 'lightbox') || currentPhoto?.image;

    // 设置当前图片加载状态
    if (currentLightboxSrc && !preloadedImages.has(currentLightboxSrc)) {
      setCurrentImageLoading(true);
    } else {
      setCurrentImageLoading(false);
    }

    // 预加载当前图片
    if (currentPhoto) {
      preloadImage(currentPhoto);
    }

    // 预加载前一张图片
    if (currentIndex > 0 && photos[currentIndex - 1]) {
      preloadImage(photos[currentIndex - 1]);
    }

    // 预加载后一张图片
    if (currentIndex < photos.length - 1 && photos[currentIndex + 1]) {
      preloadImage(photos[currentIndex + 1]);
    }
  }, [isOpen, currentIndex, photos, currentPhoto, preloadImage, preloadedImages]);

  // 背景滚动锁定
  useEffect(() => {
    if (isOpen) {
      // 锁定背景滚动
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 恢复背景滚动
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // ESC 键关闭功能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            handlePrev();
          }
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) {
            handleNext();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex, photos.length, onClose, handleNext, handlePrev]);

  // 背景点击关闭功能
  const handleBackgroundClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // 阻止图片点击事件冒泡
  const handleImageClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // 触摸手势处理
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    setDragOffset(info.offset.x);
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    setIsDragging(false);
    setDragOffset(0);
    
    const threshold = 100; // 滑动阈值
    const velocity = info.velocity.x;
    
    // 根据滑动距离和速度判断是否切换照片
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 && currentIndex > 0) {
        // 向右滑动，显示上一张
        handlePrev();
      } else if (info.offset.x < 0 && currentIndex < photos.length - 1) {
        // 向左滑动，显示下一张
        handleNext();
      }
    }
  }, [currentIndex, photos.length, handleNext, handlePrev]);

  if (!isOpen || !currentPhoto) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={lightboxRef}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 touch-none"
          onClick={handleBackgroundClick}
        >
          {/* 关闭按钮 */}
          <motion.button
            variants={controlVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110 touch-manipulation"
            aria-label="关闭灯箱"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </motion.button>

          {/* 导航按钮 - 上一张 */}
          {currentIndex > 0 && (
            <motion.button
              variants={controlVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm group touch-manipulation"
              aria-label="上一张照片"
              title="上一张照片 (←)"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </motion.button>
          )}

          {/* 导航按钮 - 下一张 */}
          {currentIndex < photos.length - 1 && (
            <motion.button
              variants={controlVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm group touch-manipulation"
              aria-label="下一张照片"
              title="下一张照片 (→)"
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </motion.button>
          )}

          {/* 主要内容区域 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-7xl max-h-[90vh] mx-2 sm:mx-4 flex flex-col items-center"
          >
            {/* 照片容器 */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              {/* 加载指示器 */}
              <AnimatePresence>
                {currentImageLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg z-10"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span className="text-white/80 text-sm">加载中...</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait" custom={imageDirection}>
                <motion.div
                  key={currentPhoto.image}
                  className="relative flex items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ cursor: "grabbing" }}
                  style={{
                    x: isDragging ? dragOffset : 0,
                  }}
                >
                  <motion.picture
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={imageDirection}
                    className="max-w-full max-h-[70vh] sm:max-h-[80vh] rounded-lg shadow-2xl select-none"
                    onClick={handleImageClick}
                    style={{
                      opacity: isDragging ? 0.8 : 1,
                    }}
                  >
                    {/* AVIF 格式 (最新浏览器) */}
                    {currentPhoto.formats?.avif && (
                      <source 
                        srcSet={currentPhoto.formats.avif.replace('thumbnail', 'lightbox')} 
                        type="image/avif"
                      />
                    )}
                    
                    {/* WebP 格式 (现代浏览器) */}
                    {currentPhoto.formats?.webp && (
                      <source 
                        srcSet={currentPhoto.formats.webp.replace('thumbnail', 'lightbox')} 
                        type="image/webp"
                      />
                    )}
                    
                    {/* JPEG 格式 (后备) */}
                    <motion.img
                      src={currentPhoto.formats?.jpeg?.replace('thumbnail', 'lightbox') || currentPhoto.image}
                      alt={currentPhoto.alt}
                      className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
                      draggable={false}
                      loading="eager"
                      decoding="async"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      style={{ 
                        imageRendering: '-webkit-optimize-contrast',
                        contentVisibility: 'auto'
                      }}
                    />
                  </motion.picture>
                  
                  {/* 滑动提示指示器 */}
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {dragOffset > 50 && currentIndex > 0 && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="text-sm">上一张</span>
                        </motion.div>
                      )}
                      {dragOffset < -50 && currentIndex < photos.length - 1 && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2"
                        >
                          <span className="text-sm">下一张</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 照片信息 */}
            <motion.div
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              className="mt-2 sm:mt-4 text-center text-white max-w-4xl px-2 sm:px-4"
            >
              {/* 标题 */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 leading-tight"
              >
                {currentPhoto.title}
              </motion.h2>
              
              {/* 描述 */}
              {currentPhoto.description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs sm:text-sm md:text-base text-white/80 mb-2 sm:mb-4 leading-relaxed max-w-2xl mx-auto"
                >
                  {currentPhoto.description}
                </motion.p>
              )}
              
              {/* 元数据容器 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 sm:space-y-3"
              >
                {/* 主要元数据行 */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-4 text-xs sm:text-sm text-white/70">
                  {/* 分类 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="bg-white/10 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors duration-200 text-xs sm:text-sm">
                      {currentPhoto.category}
                    </span>
                  </motion.div>
                  
                  {/* 拍摄日期 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <time
                      dateTime={currentPhoto.date.toISOString()}
                      className="bg-white/10 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm"
                    >
                      {currentPhoto.date.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </motion.div>
                  
                  {/* 照片计数 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="bg-white/10 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                      {currentIndex + 1} / {photos.length}
                    </span>
                  </motion.div>
                </div>
                
                {/* 标签行 */}
                {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-4 h-4 text-white/50 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {currentPhoto.tags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded-full text-xs backdrop-blur-sm hover:bg-blue-500/30 transition-colors duration-200 cursor-default"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
                
                {/* 技术信息行（如果有尺寸信息） */}
                {(currentPhoto.width || currentPhoto.height) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                    className="flex items-center justify-center gap-4 text-xs text-white/50"
                  >
                    {currentPhoto.width && currentPhoto.height && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span>{currentPhoto.width} × {currentPhoto.height}</span>
                      </div>
                    )}
                    
                    {/* 预加载状态指示器 */}
                    <AnimatePresence>
                      {preloadedImages.size > 1 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full backdrop-blur-sm"
                        >
                          已预加载 {preloadedImages.size} 张
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 键盘提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center px-2"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="hidden md:inline bg-white/10 px-2 py-1 rounded backdrop-blur-sm text-xs"
              >
                ESC 关闭
              </motion.span>
              {photos.length > 1 && (
                <>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="hidden md:inline bg-white/10 px-2 py-1 rounded backdrop-blur-sm text-xs"
                  >
                    ← → 切换
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.25 }}
                    className="md:hidden bg-white/10 px-2 py-1 rounded backdrop-blur-sm text-xs"
                  >
                    滑动切换
                  </motion.span>
                </>
              )}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm text-xs"
              >
                点击背景关闭
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoLightbox;