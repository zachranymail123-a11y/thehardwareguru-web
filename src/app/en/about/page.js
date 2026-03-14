import Page, { generateMetadata as baseMetadata } from '../../about/page';

export default async function ProxyPage() {
  return <Page isEn={true} />;
}

export async function generateMetadata(props) {
  return baseMetadata({ ...props, isEn: true });
