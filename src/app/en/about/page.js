import Page, { generateMetadata as baseMetadata } from '../../about/page';

export default function ProxyPage() {
  return <Page isEn={true} />;
}

export function generateMetadata() {
  return baseMetadata({ isEn: true });
}
