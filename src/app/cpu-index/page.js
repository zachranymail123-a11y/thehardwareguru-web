import CpuIndexPage, { generateMetadata as baseMetadata } from '../../cpu-index/page';

export const generateMetadata = () => baseMetadata({ isEn: true });
export default function EnCpuIndex() { return <CpuIndexPage isEn={true} />; }
