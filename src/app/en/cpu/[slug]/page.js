import Page, { generateMetadata as originalGenerateMetadata } from '../../../cpu/[slug]/page';

/**
 * GURU MASTER PROXY: Detail CPU EN
 * Vynucuje angličtinu pro cestu /en/cpu/[slug]
 */

export const runtime = "nodejs";

export async function generateMetadata(props) {
  // Přidáme isEn: true do props pro metadata
  return originalGenerateMetadata({ ...props, isEn: true });
}

export default function EnCpuProxyPage(props) {
  // Přidáme isEn: true do props pro samotnou stránku
  return <Page {...props} isEn={true} />;
}
