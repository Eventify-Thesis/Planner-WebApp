import { BASE_COLORS } from '@/styles/themes/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface TicketSummaryProps {}

export const TicketSummary: React.FC<TicketSummaryProps> = () => {
  const { t } = useTranslation();
  return (
    <SummaryWrapper>
      <TotalContainer>
        <TotalLabel>{t('checkout.temporaryCalculate')}</TotalLabel>
        <TotalAmount>8.000.000 đ</TotalAmount>
      </TotalContainer>
      <InstructionContainer>
        <Instruction>{t('checkout.pleaseFill')}</Instruction>
      </InstructionContainer>
    </SummaryWrapper>
  );
};

const SummaryWrapper = styled.div`
  display: flex;
  margin-top: 16px;
  width: 100%;
  flex-direction: column;
  line-height: 1;
`;

const TotalContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
`;

const TotalLabel = styled.span`
  color: #000000;
`;

const TotalAmount = styled.span`
  color: ${BASE_COLORS['yellow']};
  text-align: right;
`;

const InstructionContainer = styled.div`
  display: flex;
  width: 100%;
  padding-top: 15px;
  justify-content: center;
`;

const Instruction = styled.p`
  font-size: 13px;
  color: #010101;
  font-weight: 400;
  text-align: center;
  margin: 0;
`;
