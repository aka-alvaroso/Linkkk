/**
 * File Upload Middleware
 * Handles multipart form data with security validations
 */

const multer = require('multer');
const { fileTypeFromBuffer } = require('file-type');
const { errorResponse } = require('../utils/response');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

// File size limits
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_DIMENSION = 150;
const MAX_DIMENSION = 2000;

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter for initial extension check
const fileFilter = (req, file, cb) => {
  const ext = file.originalname.toLowerCase().split('.').pop();
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error('Invalid file extension. Allowed: PNG, JPG, JPEG, GIF, WEBP'),
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'),
      false
    );
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Validate file MIME type using magic bytes
 * More secure than relying on file extension
 */
const validateRealMimeType = async (req, res, next) => {
  if (!req.file) {
    return errorResponse(res, {
      code: 'FILE_REQUIRED',
      message: 'No file uploaded',
      statusCode: 400,
    });
  }

  try {
    const fileType = await fileTypeFromBuffer(req.file.buffer);

    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return errorResponse(res, {
        code: 'INVALID_FILE_TYPE',
        message:
          'Invalid file type detected. Only PNG, JPG, GIF, WEBP are allowed.',
        statusCode: 400,
      });
    }

    req.file.validatedMime = fileType.mime;
    next();
  } catch (error) {
    return errorResponse(res, {
      code: 'FILE_VALIDATION_ERROR',
      message: 'Failed to validate file type',
      statusCode: 400,
    });
  }
};

/**
 * Validate image dimensions using sharp
 */
const validateImageDimensions = async (req, res, next) => {
  try {
    const sharp = require('sharp');
    const metadata = await sharp(req.file.buffer).metadata();

    if (metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
      return errorResponse(res, {
        code: 'IMAGE_TOO_SMALL',
        message: `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels. Your image is ${metadata.width}x${metadata.height}px.`,
        statusCode: 400,
      });
    }

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return errorResponse(res, {
        code: 'IMAGE_TOO_LARGE',
        message: `Image dimensions must not exceed ${MAX_DIMENSION}x${MAX_DIMENSION} pixels`,
        statusCode: 400,
      });
    }

    req.file.dimensions = {
      width: metadata.width,
      height: metadata.height,
    };

    next();
  } catch (error) {
    // If sharp fails, allow upload - Cloudinary will handle it
    console.warn('Could not validate image dimensions:', error.message);
    next();
  }
};

/**
 * Handle multer errors
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 2MB limit',
        statusCode: 400,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, {
        code: 'TOO_MANY_FILES',
        message: 'Only one file allowed',
        statusCode: 400,
      });
    }
    return errorResponse(res, {
      code: 'UPLOAD_ERROR',
      message: error.message,
      statusCode: 400,
    });
  }

  if (error) {
    return errorResponse(res, {
      code: 'UPLOAD_ERROR',
      message: error.message,
      statusCode: 400,
    });
  }

  next();
};

module.exports = {
  upload,
  validateRealMimeType,
  validateImageDimensions,
  handleMulterError,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIN_DIMENSION,
  MAX_DIMENSION,
};
