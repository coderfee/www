/**
 * 错误处理和网络连接工具
 */

// 错误类型定义
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  IMAGE_LOAD_ERROR = 'image_load_error',
  COMPONENT_ERROR = 'component_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  timestamp: number;
  url?: string;
  userAgent?: string;
  stack?: string;
}

// 错误收集器
class ErrorCollector {
  private static instance: ErrorCollector;
  private errors: ErrorInfo[] = [];
  private maxErrors = 50; // 最多保存50个错误

  static getInstance(): ErrorCollector {
    if (!ErrorCollector.instance) {
      ErrorCollector.instance = new ErrorCollector();
    }
    return ErrorCollector.instance;
  }

  /**
   * 记录错误
   */
  recordError(type: ErrorType, message: string, additionalInfo?: Partial<ErrorInfo>): void {
    const error: ErrorInfo = {
      type,
      message,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...additionalInfo,
    };

    this.errors.unshift(error);
    
    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // 在开发环境下打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type}] ${message}`, error);
    }

    // 发送错误到分析服务（如果配置了）
    this.sendErrorToAnalytics(error);
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * 获取特定类型的错误
   */
  getErrorsByType(type: ErrorType): ErrorInfo[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * 清除所有错误
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 发送错误到分析服务
   */
  private sendErrorToAnalytics(error: ErrorInfo): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `${error.type}: ${error.message}`,
        fatal: false,
        custom_map: {
          error_type: error.type,
          timestamp: error.timestamp,
        },
      });
    }

    // 可以在这里添加其他分析服务的错误报告
    // 例如 Sentry, LogRocket, Bugsnag 等
  }
}

/**
 * 网络连接监控器
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(isOnline: boolean) => void> = [];
  private connectionQuality: 'slow' | 'fast' | 'unknown' = 'unknown';

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.detectConnectionQuality();
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // 监听连接变化
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', this.handleConnectionChange.bind(this));
      }
    }
  }

  /**
   * 处理网络连接
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners(true);
    
    const errorCollector = ErrorCollector.getInstance();
    errorCollector.recordError(
      ErrorType.NETWORK_ERROR,
      'Network connection restored'
    );
  }

  /**
   * 处理网络断开
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners(false);
    
    const errorCollector = ErrorCollector.getInstance();
    errorCollector.recordError(
      ErrorType.NETWORK_ERROR,
      'Network connection lost'
    );
  }

  /**
   * 处理连接变化
   */
  private handleConnectionChange(): void {
    this.detectConnectionQuality();
  }

  /**
   * 检测连接质量
   */
  private detectConnectionQuality(): void {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = (navigator as any).connection;
    if (!connection) return;

    const effectiveType = connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.connectionQuality = 'slow';
    } else if (effectiveType === '3g' || effectiveType === '4g') {
      this.connectionQuality = 'fast';
    } else {
      this.connectionQuality = 'unknown';
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * 添加网络状态监听器
   */
  addListener(listener: (isOnline: boolean) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除网络状态监听器
   */
  removeListener(listener: (isOnline: boolean) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 获取当前网络状态
   */
  getNetworkStatus(): {
    isOnline: boolean;
    connectionQuality: 'slow' | 'fast' | 'unknown';
  } {
    return {
      isOnline: this.isOnline,
      connectionQuality: this.connectionQuality,
    };
  }

  /**
   * 测试网络连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }

    try {
      const response = await fetch('/favicon.svg', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5秒超时
      });
      
      return response.ok;
    } catch (error) {
      const errorCollector = ErrorCollector.getInstance();
      errorCollector.recordError(
        ErrorType.NETWORK_ERROR,
        `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }
}

/**
 * 图片加载错误处理器
 */
export class ImageErrorHandler {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;

  /**
   * 处理图片加载错误
   */
  static handleImageError(
    imageUrl: string,
    onRetry?: () => void,
    onMaxRetriesReached?: () => void
  ): boolean {
    const currentRetries = this.retryAttempts.get(imageUrl) || 0;
    
    if (currentRetries >= this.maxRetries) {
      if (onMaxRetriesReached) {
        onMaxRetriesReached();
      }
      
      const errorCollector = ErrorCollector.getInstance();
      errorCollector.recordError(
        ErrorType.IMAGE_LOAD_ERROR,
        `Image failed to load after ${this.maxRetries} retries: ${imageUrl}`
      );
      
      return false;
    }

    // 增加重试次数
    this.retryAttempts.set(imageUrl, currentRetries + 1);
    
    // 延迟重试
    setTimeout(() => {
      if (onRetry) {
        onRetry();
      }
    }, 1000 * (currentRetries + 1)); // 递增延迟

    const errorCollector = ErrorCollector.getInstance();
    errorCollector.recordError(
      ErrorType.IMAGE_LOAD_ERROR,
      `Image load retry ${currentRetries + 1}/${this.maxRetries}: ${imageUrl}`
    );

    return true;
  }

  /**
   * 重置图片重试计数
   */
  static resetRetryCount(imageUrl: string): void {
    this.retryAttempts.delete(imageUrl);
  }

  /**
   * 获取图片重试次数
   */
  static getRetryCount(imageUrl: string): number {
    return this.retryAttempts.get(imageUrl) || 0;
  }

  /**
   * 清除所有重试计数
   */
  static clearAllRetryCounts(): void {
    this.retryAttempts.clear();
  }
}

/**
 * 通用错误处理函数
 */
export function handleError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN_ERROR,
  additionalInfo?: Partial<ErrorInfo>
): void {
  const errorCollector = ErrorCollector.getInstance();
  const message = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;
  
  errorCollector.recordError(type, message, {
    stack,
    ...additionalInfo,
  });
}

/**
 * 获取错误统计信息
 */
export function getErrorStats(): {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  recentErrors: ErrorInfo[];
} {
  const errorCollector = ErrorCollector.getInstance();
  const errors = errorCollector.getErrors();
  
  const errorsByType = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<ErrorType, number>);
  
  // 获取最近5分钟的错误
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentErrors = errors.filter(error => error.timestamp > fiveMinutesAgo);
  
  return {
    totalErrors: errors.length,
    errorsByType,
    recentErrors,
  };
}

// 导出单例实例
export const errorCollector = ErrorCollector.getInstance();
export const networkMonitor = NetworkMonitor.getInstance();