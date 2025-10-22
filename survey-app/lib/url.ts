/**
 * Get the base URL for the application
 * Works in both development and production (Vercel)
 */
export function getBaseUrl(): string {
  // Browser (Client Components)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server Components
  // Priority 1: Explicit NEXT_PUBLIC_SITE_URL (best for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Priority 2: Vercel automatic deployment URL
  if (process.env.VERCEL_URL) {
    // VERCEL_URL doesn't include protocol, so add https://
    return `https://${process.env.VERCEL_URL}`;
  }

  // Priority 3: Development fallback
  return 'http://localhost:3000';
}
