// @ts-nocheck
// @ts-ignore
import {
  BellOutlined,
  ContainerOutlined,
  DollarOutlined,
  SecurityScanOutlined,
  UserOutlined,
} from '@ant-design/icons';
import React from 'react';

interface ProfileNavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: 'primary' | 'error' | 'warning' | 'success';
  href: string;
}

export const profileNavData: ProfileNavItem[] = [
  {
    id: 1,
    name: 'profile.nav.personalInfo.title',
    icon: <UserOutlined />,
    color: 'primary',
    href: 'personal-info',
  },
  {
    id: 2,
    name: 'profile.nav.securitySettings.title',
    icon: <SecurityScanOutlined />,
    color: 'success',
    href: 'security-settings',
  },
  {
    id: 5,
    name: 'profile.nav.cv.title',
    icon: <ContainerOutlined />,
    color: 'error',
    href: 'cv',
  },
];
