function normalizeBasePath(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/$/, "");
}

export function getAdminBasePath() {
  return normalizeBasePath(process.env.APP_BASE_PATH || "/frime-admin");
}

export function getAdminCookiePath() {
  return getAdminBasePath() || "/";
}

export function getPublicSiteUrl() {
  return (process.env.PUBLIC_SITE_URL || "https://frimecraft.com").replace(/\/$/, "");
}

export function withAdminBasePath(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const basePath = getAdminBasePath();
  return `${basePath}${normalizedPath}` || normalizedPath;
}