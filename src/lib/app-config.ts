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

function detectAdminBasePathFromPathname(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const adminIndex = normalized.indexOf("/admin");
  if (adminIndex > 0) {
    return normalized.slice(0, adminIndex);
  }

  const loginIndex = normalized.indexOf("/login");
  if (loginIndex > 0) {
    return normalized.slice(0, loginIndex);
  }

  return "";
}

export function withResolvedAdminBasePath(pathname: string) {
  if (typeof window === "undefined") {
    return withAdminBasePath(pathname);
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const detectedBasePath = detectAdminBasePathFromPathname(window.location.pathname);
  const fallbackBasePath = getAdminBasePath();
  const effectiveBasePath = detectedBasePath || fallbackBasePath;

  return `${effectiveBasePath}${normalizedPath}` || normalizedPath;
}