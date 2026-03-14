import Page, { generateMetadata as baseMetadata } from '../../privacy-policy/page';

export default function ProxyPage() {
  return <Page isEn={true} />;
}

export function generateMetadata() {
  return baseMetadata({ isEn: true });
}
