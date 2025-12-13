/**
 * Get backend API URL based on environment
 * For production, update this to your production API URL
 */
export function getBackendAPI(): string {
  // For production deployment, change this to your production API
  // Example: return 'https://api.goodseva.com/api';

  // Currently using QA environment
  // TODO: Update to production URL before Play Store release
  return 'https://qa.goodseva.com/api';

  // Uncomment and use for local development:
  // return 'http://192.168.0.114:8000';
}
