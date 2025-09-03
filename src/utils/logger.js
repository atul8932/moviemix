// Safe logging utility that prevents sensitive data exposure in production
const isDevelopment = false

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Safe logging for production - only logs non-sensitive data
  safeLog: (message, data = null) => {
    if (isDevelopment) {
      console.log(message, data);
    } else {
      // In production, only log the message without sensitive data
      console.log(message);
    }
  },
  
  // Sanitize sensitive data before logging
  sanitizeData: (data) => {
    if (!isDevelopment && data) {
      const sanitized = { ...data };
      
      // Remove or mask sensitive fields
      const sensitiveFields = [
        'password', 'token', 'secret', 'key', 'auth', 'credential',
        'payment_session_id', 'orderId', 'customerPhone', 'customerEmail'
      ];
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***REDACTED***';
        }
      });
      
      return sanitized;
    }
    return data;
  }
}; 