import React from 'react';
import * as S from './References.styles';
import {
  FacebookOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
} from '@ant-design/icons';

export const References: React.FC = () => {
  return (
    <S.ReferencesWrapper>
      <S.Text>
        Made by{' '}
        <a
          href="https://github.com/lhphat02/Grab-Team14-Frontend"
          target="_blank"
          rel="noreferrer"
        >
          Grab Bootcamp - Team 14{' '}
        </a>
        in 2024 &copy;. All rights reserved.
      </S.Text>
      <S.Icons>
        <a
          href="https://github.com/lhphat02/Grab-Team14-Frontend"
          target="_blank"
          rel="noreferrer"
        >
          <GithubOutlined />
        </a>
        {/* <a href="https://www.facebook.com/groups/altence" target="_blank" rel="noreferrer">
          <FacebookOutlined />
        </a>
        <a href="https://linkedin.com/company/altence" target="_blank" rel="noreferrer">
          <LinkedinOutlined />
        </a> */}
      </S.Icons>
    </S.ReferencesWrapper>
  );
};
