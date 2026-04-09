import UltimateGuidePage, { generateMetadata as originalMetadata } from '../../ultimatni-pruvodce/page';

export const runtime = "nodejs";
export const revalidate = 86400;

export async function generateMetadata(props) {
  // Natvrdo předáme isEn: true do původních metadat
  return await originalMetadata({ ...props, isEn: true });
}

export default function EnUltimateGuideProxy(props) {
  // Natvrdo vynutíme angličtinu do hlavní komponenty
  return <UltimateGuidePage {...props} isEn={true} />;
}
