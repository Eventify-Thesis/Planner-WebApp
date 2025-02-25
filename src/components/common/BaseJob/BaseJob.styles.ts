// @ts-nocheck
// @ts-ignore
import styled from 'styled-components';
import { NFTCard } from '@/components/nft-dashboard/common/NFTCard/NFTCard';
import { FONT_SIZE, media, FONT_FAMILY } from '@/styles/themes/constants';
import { BaseTypography } from '@/components/common/BaseTypography/BaseTypography';
import { BaseModal } from '../BaseModal/BaseModal';

export const JobCard = styled(NFTCard)`
  box-shadow: var(--box-shadow-nft-secondary-color);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0.625rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    cursor: pointer;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.625rem;

  @media only screen and ${media.xl} {
    flex-direction: row;
    gap: 1rem;
  }
`;

export const ImgWrapper = styled.div`
  position: relative;
  height: 84px;
  width: 100%;
  overflow: hidden;

  @media only screen and ${media.xl} {
    width: 84px;
    height: 84px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const IconWrapper = styled.div`
  width: 1.4375rem;
  height: 1.4375rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--text-secondary-color);

  background-color: var(--primary-color);

  font-size: ${FONT_SIZE.xs};
`;

export const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  border-top: 1px solid var(--primary-color);
  padding-top: 1rem;

  @media only screen and ${media.xl} {
    border-left: 1px solid var(--primary-color);
    padding-left: 1rem;
    border-top: none;
    padding-top: 0;
  }
`;

export const InfoHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InfoBottomWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled(BaseTypography.Title)`
  &.ant-typography {
    color: var(--primary-color);

    margin-bottom: 0;

    font-weight: 700;

    font-size: ${FONT_SIZE.md};

    @media only screen and ${media.xl} {
      font-size: ${FONT_SIZE.lg};
    }
  }
`;

export const Text = styled(BaseTypography.Text)`
  display: block;

  font-size: ${FONT_SIZE.xxs};

  color: var(--text-nft-light-color);

  font-family: ${FONT_FAMILY.secondary};

  @media only screen and ${media.xl} {
    font-size: ${FONT_SIZE.xs};
  }
`;

export const DateText = styled(Text)`
  font-style: italic;

  font-family: ${FONT_FAMILY.main};
`;

export const Label = styled(BaseTypography.Text)`
  font-size: ${FONT_SIZE.xxs};
  font-weight: 500;
  color: var(--text-nft-light-color);
  border-radius: 0.25rem;
  border: 1px solid var(--text-nft-light-color);
  padding: 0.25rem 0.5rem;
`;

export const LabelWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;
