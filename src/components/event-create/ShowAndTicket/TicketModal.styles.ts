import { Form, Modal } from 'antd';
import styled from 'styled-components';

export const DetailModal = styled(Modal)`
  //   background-color: 'rgba(81, 81, 88, 0.3)';

  && {
    .ant-modal-content {
      //   background: 'rgba(81, 81, 88, 0.3)' !important;
    }

    .ant-modal-title {
      display: flex;
      justify-content: center;
    }
  }
`;

export const ModalForm = styled(Form)`
  background-color: 'rgba(81, 81, 88, 0.3)';
`;
