import GpuIndexPage, { generateMetadata as originalGenerateMetadata } from '../../gpu-index/page';

/**
 * GURU GPU INDEX EN PROXY
 * 🚀 CÍL: Oprava předávání prop a odstranění duplicitního obsahu.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(props) {
  return originalGenerateMetadata({ ...props, isEnProxy: true });
}

export default function EnGpuIndexPage(props) {
  // 🔥 FIX: Správné přiřazení prop isEnProxy={true}
  return <GpuIndexPage {...props} isEnProxy={true} />;
}
