import Page, { generateMetadata as baseMetadata } from '../../../bottleneck/[slug]/page';
export default async function ProxyPage(props) { return <Page {...props} isEn={true} />; }
export async function generateMetadata(props) { return baseMetadata({ ...props, isEn: true }); }
