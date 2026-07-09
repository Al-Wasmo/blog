export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

const basePath =
  import.meta.env.BASE_URL === "/"
    ? ""
    : import.meta.env.BASE_URL.replace(/\/$/, "")

export const isSubpost = (id: string) => id.includes("/")

export const subpostSlug = (id: string) => id.split("/")[1]

export const withBase = (path: string) => {
  if (
    /^(?:[a-z]+:)?\/\//i.test(path) ||
    path.startsWith("mailto:") ||
    path.startsWith("#")
  ) {
    return path
  }

  if (!basePath) {
    return path || "/"
  }

  if (path === "/" || path === "") {
    return basePath
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}

export const toSiteUrl = (path: string, site: URL | string) =>
  new URL(withBase(path), site)

export const normalizePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname).replace(/\/+$/, "")
  } catch {
    return pathname.replace(/\/+$/, "")
  }
}

export const hashId = (hash: string) => decodeURIComponent(hash.slice(1))
