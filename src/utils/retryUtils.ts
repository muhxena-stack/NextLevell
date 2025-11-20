// src/utils/retryUtils.ts
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class RetryUtils {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // ✅ Tugas e: Handle specific retry-able errors
        const shouldRetry = this.shouldRetry(error);
        
        if (!shouldRetry || attempt === config.maxAttempts) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt, config);
        console.log(`🔄 Retry attempt ${attempt}/${config.maxAttempts} in ${delay}ms`);
        
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }

  private static shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response || 
      error.response?.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('timeout') ||
      error.message?.includes('network')
    );
  }

  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}