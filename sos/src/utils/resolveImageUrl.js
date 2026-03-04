// src/utils/resolveImageUrl.js

export const resolveImageUrl = (imagePath) => {
  // 1. If there's no image, return a fallback placeholder
  if (!imagePath) return '/placeholder.png'; 

  // 2. If the path is already a full internet URL, just return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // 3. Otherwise, grab the CloudFront base URL from your .env.production file
  const baseUrl = import.meta.env.VITE_S3_IMAGES_BASE_URL;

  // 4. Clean up slashes so we don't accidentally get 'domain.net//image.jpg'
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // 5. Combine them and return the full URL!
  return `${cleanBase}${cleanPath}`;
};