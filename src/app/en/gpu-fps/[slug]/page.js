import GpuFpsOverviewPage, { generateMetadata as originalGenerateMetadata } from '../../../../gpu-fps/[slug]/page';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(props) {
  // Předáme props a příznak isEn pro správná metadata
  return originalGenerateMetadata({ ...props, isEn: true });
}

export default function EnGpuFpsOverviewPage(props) {
  // Renderujeme původní komponentu s vynuceným EN jazykem
  return <GpuFpsOverviewPage {...props} isEn={true} />;
}
