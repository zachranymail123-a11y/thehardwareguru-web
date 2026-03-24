import LoginPage from '../../login/page';

export const metadata = {
  title: 'Login / Register | The Hardware Guru',
  description: 'Log in to your Hardware Guru account to ask questions and join the community.',
};

export default function LoginProxyEn(props) {
  return <LoginPage {...props} isEn={true} />;
}
