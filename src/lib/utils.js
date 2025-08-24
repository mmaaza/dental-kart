import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * This helps prevent conflicts when conditionally applying Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function for creating component variants using class-variance-authority
 * This is useful for creating consistent component APIs with Radix UI
 */
export { cva } from "class-variance-authority";

/**
 * Helper function to construct correct image URLs for uploaded files
 * @param {string} imagePath - The image path from the server
 * @returns {string} - The complete image URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove leading slash if present and construct the full URL
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // For production, construct the full URL
  if (apiUrl.startsWith('http')) {
    // Handle the API URL - remove /api suffix if present
    let baseUrl = apiUrl;
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
    }
    return `${baseUrl}/${cleanPath}`;
  } else {
    // Development: relative path
    return `/${cleanPath}`;
  }
}
