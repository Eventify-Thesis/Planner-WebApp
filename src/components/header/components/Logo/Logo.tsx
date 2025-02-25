import logo from '@/assets/logo.png';
import * as S from './Logo.styles';

export const Logo: React.FC = () => {
  return (
    <S.LogoWrapper>
      <S.LogoImage src={logo} alt="logo" />
    </S.LogoWrapper>
  );
};
