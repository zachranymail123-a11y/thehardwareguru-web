import PoradnaPage from '../../poradna/page';

export const metadata = {
  title: 'PC Help Desk VIP | The Hardware Guru',
  description: 'Having issues with your PC build or planning an upgrade? Ask the Guru.',
};

export default function PoradnaProxyEn(props) {
  return <PoradnaPage {...props} isEn={true} />;
}
