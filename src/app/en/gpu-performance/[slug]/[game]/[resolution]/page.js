import GpuPerformancePage, { generateMetadata as originalGenerateMetadata } from '../../../../../gpu-performance/[slug]/[game]/[resolution]/page';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(props) {
  return originalGenerateMetadata({ ...props, isEn: true });
}

export default function EnGpuPerformancePage(props) {
  // 🔥 FIX: Předáváme isEn={true}
  return <GpuPerformancePage {...props} isEn={true} />;
}
