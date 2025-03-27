import {
  BarChartOutlined,
  OrderedListOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  GiftOutlined,
  ScanOutlined,
  BorderOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react/dist/iconify.js';

interface MenuItem {
  key: string;
  icon: JSX.Element;
  label: string;
}

interface MenuGroup {
  type: 'group';
  key: string;
  label: string;
  children: MenuItem[];
}

const analyticsMenuItem: MenuItem = {
  key: 'analytics',
  icon: <BarChartOutlined />,
  label: 'Analytics',
};

const ordersMenuItem: MenuItem = {
  key: 'orders',
  icon: <OrderedListOutlined />,
  label: 'Order',
};

const checkinMenuItem: MenuItem = {
  key: 'checkin',
  icon: <ScanOutlined />,
  label: 'Check-in',
};

const reportMenuGroup: MenuGroup = {
  key: 'report',
  type: 'group',
  label: 'Report',
  children: [analyticsMenuItem, ordersMenuItem, checkinMenuItem],
};

const membersMenuItem: MenuItem = {
  key: 'members',
  icon: <UserOutlined />,
  label: 'Member',
};

const settingsMenuItem: MenuItem = {
  key: 'edit-event',
  icon: <SettingOutlined />,
  label: 'Setting',
};

const seatingPlansMenuItem: MenuItem = {
  key: 'seating-plans',
  icon: <Icon icon="material-symbols:map" width="16" height="16" />,
  label: 'Seating Plans',
};

const seatmapMenuItem: MenuItem = {
  key: 'seatmap/new',
  icon: <Icon icon="fluent:seat-16-filled" width="16" height="16" />,
  label: 'Seat Map',
};

const questionsMenuItem: MenuItem = {
  key: 'questions',
  icon: <QuestionCircleOutlined />,
  label: 'Question',
};

const eventSettingsMenuGroup: MenuGroup = {
  key: 'settings',
  type: 'group',
  label: 'Event Settings',
  children: [
    membersMenuItem,
    settingsMenuItem,
    seatingPlansMenuItem,
    seatmapMenuItem,
    questionsMenuItem,
  ],
};

const vouchersMenuItem: MenuItem = {
  key: 'vouchers',
  icon: <GiftOutlined />,
  label: 'Voucher',
};

const marketingMenuGroup: MenuGroup = {
  key: 'marketing',
  type: 'group',
  label: 'Marketing',
  children: [vouchersMenuItem],
};

export const menuItems = [
  reportMenuGroup,
  eventSettingsMenuGroup,
  marketingMenuGroup,
];
