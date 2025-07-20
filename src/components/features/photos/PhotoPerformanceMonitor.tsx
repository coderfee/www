import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePerformanceMonitor } from '@/utils/imageLoadingStrategy';
import { getErrorStats, networkMonitor } from '@/utils/errorHandling';

interface PerformanceStats {
  totalImages: number;
  errorCount: number;
  errorRate: number;
  pendingLoads: number;
  averageLoadTime?: number;
  slowestImage?: string;
  fastestImage?: string;
}

interface PhotoPerformanceMonitorProps {
  enabled?: boolean;
  showStats?: boolean;
}

const PhotoPerformanceMonitor: React.FC<PhotoPerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showStats = false,
}) => {
  const [imageStats, setImageStats] = useState<PerformanceStats>({
    totalImages: 0,
    errorCount: 0,
    errorRate: 0,
    pendingLoads: 0,
  });
  const [errorStats, setErrorStats] = useState<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: any[];
  }>({
    totalErrors: 0,
    errorsByType: {},
    recentErrors: [],
  });
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    connectionQuality: 'unknown' as 'slow' | 'fast' | 'unknown',
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      // 更新图片加载统计
      const monitor = ImagePerformanceMonitor.getInstance();
      setImageStats(monitor.getStats());
      
      // 更新错误统计
      setErrorStats(getErrorStats());
      
      // 更新网络状态
      setNetworkStatus(networkMonitor.getNetworkStatus());
    };

    // 初始更新
    updateStats();

    // 定期更新统计信息
    const interval = setInterval(updateStats, 2000);

    // 监听网络状态变化
    const handleNetworkChange = (isOnline: boolean) => {
      setNetworkStatus(prev => ({ ...prev, isOnline }));
    };
    
    networkMonitor.addListener(handleNetworkChange);

    // 监听性能条目
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('photos') && entry.entryType === 'resource') {
          updateStats();
        }
      });
    });

    if ('PerformanceObserver' in window) {
      observer.observe({ entryTypes: ['resource'] });
    }

    return () => {
      clearInterval(interval);
      networkMonitor.removeListener(handleNetworkChange);
      if ('PerformanceObserver' in window) {
        observer.disconnect();
      }
    };
  }, [enabled]);

  // 在开发环境中输出性能警告
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    if (imageStats.errorRate > 10) {
      console.warn(`Photo loading error rate is high: ${imageStats.errorRate.toFixed(1)}%`);
    }

    if (imageStats.pendingLoads > 5) {
      console.warn(`Many images are still loading: ${imageStats.pendingLoads} pending`);
    }

    if (errorStats.totalErrors > 10) {
      console.warn(`High number of system errors detected: ${errorStats.totalErrors}`);
    }
  }, [enabled, imageStats.errorRate, imageStats.pendingLoads, errorStats.totalErrors]);

  if (!enabled) {
    return null;
  }

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600 dark:text-red-400';
    if (value >= thresholds.warning) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  // 简化版本（当 showStats 为 false 时）
  if (!showStats) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="font-semibold text-green-400">Photo Performance</div>
          <div>Total: {imageStats.totalImages}</div>
          <div>Errors: {imageStats.errorCount} ({imageStats.errorRate.toFixed(1)}%)</div>
          <div>Pending: {imageStats.pendingLoads}</div>
          {imageStats.averageLoadTime && (
            <div>Avg Load: {imageStats.averageLoadTime.toFixed(0)}ms</div>
          )}
        </div>
      </div>
    );
  }

  // 详细版本（当 showStats 为 true 时）
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-full shadow-lg transition-colors duration-200 ${
          !networkStatus.isOnline || errorStats.totalErrors > 0
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : imageStats.errorRate > 10
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-violet-500 hover:bg-violet-600'
        } text-white`}
        title={`性能监控 ${!networkStatus.isOnline ? '(离线)' : errorStats.totalErrors > 0 ? '(有错误)' : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-14 right-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 min-w-[280px] max-h-[400px] overflow-y-auto"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              性能监控
              {!networkStatus.isOnline && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                  离线
                </span>
              )}
            </h3>
            
            {/* 网络状态 */}
            <div className="mb-4 p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded">
              <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">网络状态</h4>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">连接:</span>
                <span className={networkStatus.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {networkStatus.isOnline ? '在线' : '离线'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">质量:</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {networkStatus.connectionQuality === 'fast' ? '快速' : 
                   networkStatus.connectionQuality === 'slow' ? '慢速' : '未知'}
                </span>
              </div>
            </div>
            
            {/* 图片加载统计 */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">图片加载统计</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">总图片数:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {imageStats.totalImages}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">加载中:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {imageStats.pendingLoads}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">加载错误:</span>
                  <span className={`font-medium ${getStatusColor(imageStats.errorCount, { warning: 1, danger: 5 })}`}>
                    {imageStats.errorCount}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">错误率:</span>
                  <span className={`font-medium ${getStatusColor(imageStats.errorRate, { warning: 5, danger: 15 })}`}>
                    {imageStats.errorRate.toFixed(1)}%
                  </span>
                </div>
                
                {imageStats.averageLoadTime && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">平均加载:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {imageStats.averageLoadTime.toFixed(0)}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 系统错误统计 */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">系统错误统计</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">总错误数:</span>
                  <span className={`font-medium ${getStatusColor(errorStats.totalErrors, { warning: 5, danger: 15 })}`}>
                    {errorStats.totalErrors}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">最近错误:</span>
                  <span className={`font-medium ${getStatusColor(errorStats.recentErrors.length, { warning: 2, danger: 5 })}`}>
                    {errorStats.recentErrors.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 警告信息 */}
            {imageStats.errorRate > 20 && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                ⚠️ 图片错误率过高，请检查网络连接
              </div>
            )}
            
            {!networkStatus.isOnline && (
              <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-300">
                🔌 网络连接已断开，部分功能可能受限
              </div>
            )}
            
            {errorStats.recentErrors.length > 0 && (
              <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
                🚨 检测到 {errorStats.recentErrors.length} 个最近错误
              </div>
            )}
            
            {/* 最近错误详情 */}
            {errorStats.recentErrors.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
                  查看最近错误 ({errorStats.recentErrors.length})
                </summary>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {errorStats.recentErrors.slice(0, 5).map((error: any, index: number) => (
                    <div key={index} className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                      <div className="font-mono text-red-600 dark:text-red-400">
                        {error.type}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-400 truncate">
                        {error.message}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-500 text-xs">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoPerformanceMonitor;