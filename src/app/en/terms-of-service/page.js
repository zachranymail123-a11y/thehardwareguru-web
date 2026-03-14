import Page, { generateMetadata as baseMetadata } from '../../terms-of-service/page';

export default function ProxyPage() {
  return <Page isEn={true} />;
}

export function generateMetadata() {
  return baseMetadata({ isEn: true });
}
