const AuditLog = require('../models/AuditLog');

// Middleware to automatically log API requests
const auditLogger = (options = {}) => {
  const {
    excludePaths = ['/health', '/api/auth/me'],
    excludeMethods = ['GET'],
    logLevel = 'all' // 'all', 'admin-only', 'high-risk-only'
  } = options;

  return async (req, res, next) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.originalUrl.includes(path))) {
      return next();
    }

    // Skip logging for excluded methods (unless it's admin endpoint)
    const isAdminEndpoint = req.originalUrl.includes('/admin/');
    if (!isAdminEndpoint && excludeMethods.includes(req.method)) {
      return next();
    }

    // Skip if not authenticated (will be handled by auth middleware)
    if (!req.user) {
      return next();
    }

    // Determine if we should log based on log level
    let shouldLog = false;
    
    switch (logLevel) {
      case 'all':
        shouldLog = true;
        break;
      case 'admin-only':
        shouldLog = ['admin', 'super-admin'].includes(req.user.role);
        break;
      case 'high-risk-only':
        shouldLog = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ||
                   isAdminEndpoint ||
                   req.originalUrl.includes('/users/') ||
                   req.originalUrl.includes('/policies/');
        break;
      default:
        shouldLog = true;
    }

    if (!shouldLog) {
      return next();
    }

    // Store original res.json to intercept response
    const originalJson = res.json;
    let responseData = null;
    let responseStatus = null;
    const startTime = Date.now();

    // Override res.json to capture response
    res.json = function(data) {
      responseData = data;
      responseStatus = res.statusCode;
      return originalJson.call(this, data);
    };

    // Continue with request
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        const executionTime = Date.now() - startTime;
        
        // Determine action type based on method and endpoint
        let actionType = 'READ';
        switch (req.method) {
          case 'POST':
            actionType = 'CREATE';
            break;
          case 'PUT':
          case 'PATCH':
            actionType = 'UPDATE';
            break;
          case 'DELETE':
            actionType = 'DELETE';
            break;
          default:
            actionType = 'READ';
        }

        // Determine resource based on endpoint
        let resource = 'SYSTEM';
        if (req.originalUrl.includes('/users')) resource = 'USER';
        else if (req.originalUrl.includes('/policies')) resource = 'POLICY';
        else if (req.originalUrl.includes('/projects')) resource = 'PROJECT';
        else if (req.originalUrl.includes('/tasks')) resource = 'TASK';
        else if (req.originalUrl.includes('/audit')) resource = 'SYSTEM';

        // Extract resource ID from URL if available
        let resourceId = null;
        const idMatch = req.originalUrl.match(/\/([a-f\d]{24})(?:\/|$)/i);
        if (idMatch) {
          resourceId = idMatch[1];
        }

        // Determine severity based on action and endpoint
        let severity = 'LOW';
        if (actionType === 'DELETE' || req.originalUrl.includes('/admin/')) {
          severity = 'HIGH';
        } else if (['CREATE', 'UPDATE'].includes(actionType)) {
          severity = 'MEDIUM';
        }

        // Determine status based on response code
        let status = 'SUCCESS';
        if (responseStatus >= 400) {
          status = 'FAILED';
        } else if (responseStatus >= 300) {
          status = 'WARNING';
        }

        // Create audit log entry
        await AuditLog.createLog({
          user: req.user.id,
          action: `${req.method} ${req.originalUrl}`,
          actionType,
          resource,
          resourceId,
          details: generateActionDescription(req.method, req.originalUrl, responseStatus),
          status,
          severity,
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            method: req.method,
            endpoint: req.originalUrl,
            responseStatus,
            executionTime,
            requestBody: sanitizeRequestBody(req.body),
            queryParams: req.query,
            sessionId: req.sessionID
          }
        });

      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw error to avoid breaking the main request
      }
    });
  };
};

// Generate human-readable action description
function generateActionDescription(method, url, statusCode) {
  const pathParts = url.split('/').filter(Boolean);
  const resource = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];
  
  const actionMap = {
    'GET': statusCode >= 400 ? 'Failed to retrieve' : 'Retrieved',
    'POST': statusCode >= 400 ? 'Failed to create' : 'Created',
    'PUT': statusCode >= 400 ? 'Failed to update' : 'Updated',
    'PATCH': statusCode >= 400 ? 'Failed to update' : 'Updated',
    'DELETE': statusCode >= 400 ? 'Failed to delete' : 'Deleted'
  };

  const action = actionMap[method] || 'Accessed';
  return `${action} ${resource}`;
}

// Sanitize request body to remove sensitive data
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'confirmPassword', 'token', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Middleware specifically for high-risk operations
const auditHighRisk = async (req, res, next) => {
  const originalJson = res.json;
  const startTime = Date.now();
  
  // Override response to capture result
  res.json = function(data) {
    const executionTime = Date.now() - startTime;
    
    // Log high-risk operation
    AuditLog.createLog({
      user: req.user.id,
      action: `High-risk operation: ${req.method} ${req.originalUrl}`,
      actionType: req.method === 'DELETE' ? 'DELETE' : 'UPDATE',
      resource: 'SYSTEM',
      details: `Performed high-risk operation with status ${res.statusCode}`,
      status: res.statusCode >= 400 ? 'FAILED' : 'SUCCESS',
      severity: 'CRITICAL',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        responseStatus: res.statusCode,
        executionTime,
        requestBody: sanitizeRequestBody(req.body)
      }
    }).catch(error => {
      console.error('High-risk audit logging error:', error);
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Rate limiting violation logger
const auditRateLimit = async (req, res, next) => {
  await AuditLog.createLog({
    user: req.user ? req.user.id : null,
    action: 'Rate limit exceeded',
    actionType: 'READ',
    resource: 'SYSTEM',
    details: `Rate limit exceeded for IP: ${req.ip}`,
    status: 'FAILED',
    severity: 'MEDIUM',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      endpoint: req.originalUrl
    }
  });
  
  next();
};

module.exports = {
  auditLogger,
  auditHighRisk,
  auditRateLimit
};