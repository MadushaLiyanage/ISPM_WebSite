const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Base upload directory
const uploadBaseDir = path.join(__dirname, '../../uploads');
createUploadDir(uploadBaseDir);

// Policy files storage
const policyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const policyDir = path.join(uploadBaseDir, 'policies');
    createUploadDir(policyDir);
    cb(null, policyDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const fileName = `${baseName}-${uniqueSuffix}${extension}`;
    cb(null, fileName);
  }
});

// Avatar/profile images storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(uploadBaseDir, 'avatars');
    createUploadDir(avatarDir);
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const fileName = `avatar-${uniqueSuffix}${extension}`;
    cb(null, fileName);
  }
});

// General documents storage
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const docDir = path.join(uploadBaseDir, 'documents');
    createUploadDir(docDir);
    cb(null, docDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const fileName = `${baseName}-${uniqueSuffix}${extension}`;
    cb(null, fileName);
  }
});

// File filter for policy documents
const policyFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'text/markdown',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Markdown, TXT, DOC, and DOCX files are allowed.'), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// File size limits (in bytes)
const fileSizeLimits = {
  policy: 10 * 1024 * 1024, // 10MB for policy documents
  avatar: 2 * 1024 * 1024,  // 2MB for avatars
  document: 25 * 1024 * 1024 // 25MB for general documents
};

// Multer configurations
const uploadPolicyFile = multer({
  storage: policyStorage,
  fileFilter: policyFileFilter,
  limits: {
    fileSize: fileSizeLimits.policy
  }
}).single('policyFile');

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: fileSizeLimits.avatar
  }
}).single('avatar');

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: fileSizeLimits.document
  }
}).single('document');

// Multiple file upload for training materials
const uploadTrainingMaterials = multer({
  storage: documentStorage,
  limits: {
    fileSize: fileSizeLimits.document,
    files: 10 // Maximum 10 files
  }
}).array('materials', 10);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large',
          error: err.message
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files',
          error: err.message
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field',
          error: err.message
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

// Utility function to delete files
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// File validation utility
const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024,
    allowedTypes = [],
    required = true
  } = options;

  if (!file && required) {
    throw new Error('File is required');
  }

  if (file) {
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  return true;
};

// Get file info utility
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date()
  };
};

module.exports = {
  uploadPolicyFile,
  uploadAvatar,
  uploadDocument,
  uploadTrainingMaterials,
  handleUploadError,
  deleteFile,
  validateFile,
  getFileInfo,
  fileSizeLimits,
  uploadBaseDir
};