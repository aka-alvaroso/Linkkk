/**
 * Cloudinary Service
 * Handles image uploads for QR code logos
 */

const cloudinary = require('cloudinary').v2;
const config = require('../config/environment');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Upload a logo image to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} userId - The user ID for folder organization
 * @param {string} shortUrl - The short URL for unique naming
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadLogo = async (fileBuffer, userId, shortUrl) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `linkkk/qr-logos/${userId}`,
        public_id: `logo_${shortUrl}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        allowed_formats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', {
            error: error.message,
            userId,
            shortUrl,
          });
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a logo from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @throws {Error} If deletion fails
 */
const deleteLogo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('Cloudinary logo deleted', { publicId, result });
    
    // Cloudinary returns { result: 'ok' } on success, { result: 'not found' } if doesn't exist
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary delete returned: ${result.result}`);
    }
  } catch (error) {
    logger.error('Cloudinary delete failed', {
      error: error.message,
      publicId,
    });
    throw error; // Re-throw so caller can handle it
  }
};

module.exports = {
  uploadLogo,
  deleteLogo,
  cloudinary,
};
