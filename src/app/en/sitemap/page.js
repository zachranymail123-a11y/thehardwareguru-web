import SitemapPage, { generateMetadata as sitemapMetadata } from '../../sitemap/page';

/**
 * GURU EN SITEMAP PROXY
 * Cesta: src/app/en/sitemap/page.js
 */

export const runtime = "nodejs";
export const revalidate = 86400;

export async function generateMetadata(props) {
  return sitemapMetadata({ ...props, isEn: true });
}

export default async function Page(props) {
  return <SitemapPage {...props} isEn={true} />;
}
