import Page, { generateMetadata as originalGenerateMetadata } from '../../../gpu-performance/[slug]/page';

export const runtime = "nodejs";

export async function generateMetadata(props) {
  return originalGenerateMetadata({ ...props, isEn: true });
}

export default function EnGpuPerformanceProxy(props) {
  return <Page {...props} isEn={true} />;
}
