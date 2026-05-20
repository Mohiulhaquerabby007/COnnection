import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if environment variables are set
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a local file to Cloudinary or retains local storage fallback.
 * @param {string} filePath - Absolute path to local file.
 * @returns {Promise<{url: string, publicId: string|null}>} File details.
 */
export const uploadImage = async (filePath) => {
  try {
    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'tinder_clone_profiles',
        transformation: [{ width: 600, height: 600, crop: 'fill', gravity: 'face' }]
      });

      // Synchronously delete temporary local file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } else {
      // Local fallback: return relative static server path
      const fileName = filePath.split(/[\\/]/).pop();
      const localUrl = `/uploads/${fileName}`;
      
      console.log('Cloudinary not configured. Falling back to local upload:', localUrl);

      return {
        url: localUrl,
        publicId: null
      };
    }
  } catch (error) {
    console.error('Image uploader error:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Deletes a file from Cloudinary or local uploads folder.
 * @param {string} urlOrPublicId - URL or public ID of the resource to delete.
 */
export const deleteImage = async (urlOrPublicId) => {
  try {
    if (isCloudinaryConfigured() && urlOrPublicId && !urlOrPublicId.startsWith('/uploads')) {
      await cloudinary.uploader.destroy(urlOrPublicId);
    } else if (urlOrPublicId && urlOrPublicId.startsWith('/uploads')) {
      // Local clean up
      const fileName = urlOrPublicId.split('/').pop();
      const localPath = `uploads/${fileName}`;
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (error) {
    console.error('Image deletion error:', error);
  }
};
