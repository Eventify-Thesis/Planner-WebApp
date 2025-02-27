import styled from 'styled-components';

export const StyledFormContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  // background: #15161b;
  background: #15161b;
  color: white;
  z-index: 1000;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: -24px -24px 24px;

  && {
    .ant-steps-item-title {
      color: white !important;
    }

    && .ant-steps-item-icon {
      color: white !important;
    }
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const NavigationControls = styled.div`
  display: flex;
  gap: 16px;
`;
