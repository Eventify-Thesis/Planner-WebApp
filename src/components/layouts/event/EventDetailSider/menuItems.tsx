import {
  IconChartBar,
  IconList,
  IconUser,
  IconSettings,
  IconQuestionMark,
  IconGift,
  IconScan,
  IconUsers,
  IconMap,
  IconArmchair,
  IconArmchair2,
  IconBrandFacebook,
} from '@tabler/icons-react';

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

const dashboardMenuItem: MenuItem = {
  key: 'dashboard',
  icon: <IconChartBar size={16} />,
  label: 'Dashboard',
};

const ordersMenuItem: MenuItem = {
  key: 'orders',
  icon: <IconList size={16} />,
  label: 'Order',
};

const attendeesMenuItem: MenuItem = {
  key: 'attendees',
  icon: <IconUsers size={16} />,
  label: 'Attendee',
};

const checkinMenuItem: MenuItem = {
  key: 'checkin',
  icon: <IconScan size={16} />,
  label: 'Check-in',
};

const marketingMenuItem: MenuItem = {
  key: 'marketing',
  icon: <IconBrandFacebook size={16} />,
  label: 'Marketing',
};

const reportMenuGroup: MenuGroup = {
  key: 'report',
  type: 'group',
  label: 'Report',
  children: [
    dashboardMenuItem,
    ordersMenuItem,
    attendeesMenuItem,
    checkinMenuItem,
    marketingMenuItem,
  ],
};

const membersMenuItem: MenuItem = {
  key: 'members',
  icon: <IconUser size={16} />,
  label: 'Member',
};

const settingsMenuItem: MenuItem = {
  key: 'edit-event',
  icon: <IconSettings size={16} />,
  label: 'Setting',
};

const seatingPlansMenuItem: MenuItem = {
  key: 'seating-plans',
  icon: <IconMap size={16} />,
  label: 'Seating Plans',
};

const seatmapMenuItem: MenuItem = {
  key: 'seatmap/new',
  icon: <IconArmchair size={16} />,
  label: 'Seat Map',
};

const seatCategoryMappingMenuItem: MenuItem = {
  key: 'seat-category-mapping',
  icon: <IconArmchair2 size={16} />,
  label: 'Seat Category Mapping',
};

const questionsMenuItem: MenuItem = {
  key: 'questions',
  icon: <IconQuestionMark size={16} />,
  label: 'Question',
};

const seatingMenuGroup: MenuGroup = {
  key: 'seating',
  type: 'group',
  label: 'Seating',
  children: [
    seatingPlansMenuItem,
    seatmapMenuItem,
    seatCategoryMappingMenuItem,
  ],
};

const eventSettingsMenuGroup: MenuGroup = {
  key: 'settings',
  type: 'group',
  label: 'Event Settings',
  children: [membersMenuItem, settingsMenuItem, questionsMenuItem],
};

const vouchersMenuItem: MenuItem = {
  key: 'vouchers',
  icon: <IconGift size={16} />,
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
  seatingMenuGroup,
  eventSettingsMenuGroup,
  marketingMenuGroup,
];
