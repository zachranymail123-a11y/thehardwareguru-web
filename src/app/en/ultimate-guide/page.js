import UltimateGuidePage, { generateMetadata as originalMetadata } from '../../ultimatni-pruvodce/page';

export const runtime = "nodejs";
export const revalidate = 86400;

// Natáhne a vygeneruje Google Golden Rich metada z hlavního souboru
export const generateMetadata = originalMetadata;

// Vykreslí hlavní Pillar Page
export default function EnUltimateGuideProxy(props) {
  return <UltimateGuidePage {...props} />;
}
