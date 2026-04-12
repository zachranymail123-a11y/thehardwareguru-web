import GpuFpsHunterPage, { generateMetadata as originalGenerateMetadata } from '../../../gpu-fps/[slug]/page';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(props) {
  return originalGenerateMetadata({ ...props, isEn: true });
}

export default function EnGpuFpsHunterPage(props) {
  return <GpuFpsHunterPage {...props} isEn={true} />;
}
