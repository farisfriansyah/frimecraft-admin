const portfolioUploadPrefix = "/uploads/portfolio/";

export const MAX_PORTFOLIO_IMAGE_SIZE = 5 * 1024 * 1024;
export const PORTFOLIO_IMAGE_MIME_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function getPortfolioImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  if (!normalizedPath.startsWith(portfolioUploadPrefix)) return imageUrl;

  const filename = normalizedPath.slice(portfolioUploadPrefix.length);
  return `/api/portfolio-images?filename=${encodeURIComponent(filename)}`;
}
