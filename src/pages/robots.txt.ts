import type { APIRoute } from "astro"
import { toSiteUrl } from "@/lib/utils"

export const GET: APIRoute = ({ site }) => {
  const sitemap = toSiteUrl("/sitemap-index.xml", site!)
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`)
}
