import Page, { generateMetadata as originalGenerateMetadata } from '../../../cpu/[slug]/page';

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 🔥 Vynutíme dynamiku, aby hlavičky nezlobily

export async function generateMetadata(props) {
  const params = await props.params;
  return originalGenerateMetadata({ params, isEn: true });
}

export default async function EnCpuProxyPage(props) {
  const params = await props.params;
  return <Page params={params} isEn={true} />;
}
