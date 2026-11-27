function normalizeBasePath(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/$/, "");
}

export function getAdminBasePath() {
  const configuredBasePath = process.env.APP_BASE_PATH;
  return normalizeBasePath(
    configuredBasePath && configuredBasePath !== "/" ? configuredBasePath : "/frime-admin",
  );
}

export function getAdminCookiePath() {
  return getAdminBasePath() || "/";
}

export function getPublicSiteUrl() {
  return (process.env.PUBLIC_SITE_URL || "https://frimecraft.com").replace(/\/$/, "");
}

function addBasePath(pathname: string, basePath: string) {
  if (/^[a-z][a-z\d+.-]*:/i.test(pathname) || pathname.startsWith("//")) return pathname;

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}` || normalizedPath;
}

export function withAdminBasePath(pathname: string) {
  return addBasePath(pathname, getAdminBasePath());
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

  const detectedBasePath = detectAdminBasePathFromPathname(window.location.pathname);
  const fallbackBasePath = getAdminBasePath();
  const effectiveBasePath = detectedBasePath || fallbackBasePath;

  return addBasePath(pathname, effectiveBasePath);
}