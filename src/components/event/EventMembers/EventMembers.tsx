import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Select,
  Form,
  Typography,
  notification,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  EventPermission,
  EVENT_ROLE_PERMISSIONS,
  EVENT_PERMISSION_LABELS,
  EVENT_ROLE_LABELS,
} from './types';
import {
  addMemberAPI,
  deleteMemberAPI,
  listMembersAPI,
  updateMemberRoleAPI,
} from '../../../api/member.api';
import { useEvent } from '../../../contexts/EventContext';
import { MemberModel } from '@/domain/MemberModel';
import { EventRole } from '@/constants/enums/event';
import { BASE_COLORS, FONT_WEIGHT } from '@/styles/themes/constants';

const { Text } = Typography;

const EventMembers: React.FC = () => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const { eventBrief } = useEvent();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<MemberModel[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  const fetchMembers = async (page: number = 1, search?: string) => {
    if (!eventBrief) return;

    try {
      setLoading(true);
      const response = await listMembersAPI(eventId!, {
        page,
        limit: pagination.limit,
        search,
      });
      const { docs, totalDocs, totalPages } = response;
      setMembers(docs);
      setPagination({
        ...pagination,
        current: page,
        total: totalDocs,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      let description = t('common.error');

      switch (errorMessage) {
        case 'Member already exists in the organization':
          description = t('members.errors.alreadyExists');
          break;
        case 'Member not found':
          description = t('members.errors.notFound');
          break;
        case 'You cannot assign this role':
          description = t('members.errors.cannotAssignRole');
          break;
        case 'You cannot delete this member':
          description = t('members.errors.cannotDeleteMember');
          break;
        case 'You cannot manage this role':
          description = t('members.errors.cannotManageRole');
          break;
        case 'You are not a member of this organization':
          description = t('members.errors.notOrganizationMember');
          break;
        case 'Error occurred while managing Clerk organization membership':
          description = t('members.errors.clerkError');
          break;
        default:
          description = t('members.list.error');
      }

      notification.error({
        message: t('common.error'),
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && eventBrief) {
      fetchMembers(1, searchText);
    }
  }, [eventId, eventBrief]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchMembers(1, value);
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingMember(null);
    setIsModalVisible(true);
  };

  const showEditModal = (member: MemberModel) => {
    setEditingMember(member);
    form.setFieldsValue({ role: member.role });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!eventBrief) return;

    try {
      const values = await form.validateFields();
      if (editingMember) {
        await updateMemberRoleAPI(eventId!, editingMember.userId, {
          role: values.role,
        });
        notification.success({
          message: t('members.update.success'),
        });
      } else {
        await addMemberAPI(eventId!, {
          email: values.email,
          role: values.role,
          organizationId: eventBrief.organizationId!,
        });
        notification.success({
          message: t('members.add.success'),
        });
      }
      setIsModalVisible(false);
      fetchMembers(pagination.current, searchText);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      let description = t('common.error');

      switch (errorMessage) {
        case 'Member already exists in the organization':
          description = t('members.errors.alreadyExists');
          break;
        case 'Member not found':
          description = t('members.errors.notFound');
          break;
        case 'You cannot assign this role':
          description = t('members.errors.cannotAssignRole');
          break;
        case 'You cannot delete this member':
          description = t('members.errors.cannotDeleteMember');
          break;
        case 'You cannot manage this role':
          description = t('members.errors.cannotManageRole');
          break;
        case 'You are not a member of this organization':
          description = t('members.errors.notOrganizationMember');
          break;
        case 'Error occurred while managing Clerk organization membership':
          description = t('members.errors.clerkError');
          break;
        default:
          description = editingMember
            ? t('members.update.error')
            : t('members.add.error');
      }

      notification.error({
        message: t('common.error'),
        description,
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!eventBrief) return;

    try {
      await deleteMemberAPI(eventId!, userId);
      notification.success({
        message: t('members.delete.success'),
      });
      fetchMembers(pagination.current, searchText);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      let description = t('common.error');

      switch (errorMessage) {
        case 'Member already exists in the organization':
          description = t('members.errors.alreadyExists');
          break;
        case 'Member not found':
          description = t('members.errors.notFound');
          break;
        case 'You cannot assign this role':
          description = t('members.errors.cannotAssignRole');
          break;
        case 'You cannot delete this member':
          description = t('members.errors.cannotDeleteMember');
          break;
        case 'You cannot manage this role':
          description = t('members.errors.cannotManageRole');
          break;
        case 'You are not a member of this organization':
          description = t('members.errors.notOrganizationMember');
          break;
        case 'Error occurred while managing Clerk organization membership':
          description = t('members.errors.clerkError');
          break;
        default:
          description = t('members.delete.error');
      }

      notification.error({
        message: t('common.error'),
        description,
      });
    }
  };

  const columns = [
    {
      title: t('members.table.member'),
      key: 'member',
      render: (record: MemberModel) => (
        <Space direction="vertical" size={0}>
          <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
          <Text type="secondary">{record.email}</Text>
        </Space>
      ),
    },
    {
      title: t('members.table.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: EventRole) => t(`members.role.${role}`),
    },
    {
      title: t('members.table.actions'),
      key: 'actions',
      render: (_: any, record: MemberModel) => (
        <Space
          size="middle"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button size="small" onClick={() => showEditModal(record)}>
            <EditOutlined />
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record.userId)}
            icon={<DeleteOutlined />}
          ></Button>
        </Space>
      ),
    },
  ];

  const permissionColumns = Object.keys(EVENT_ROLE_LABELS).map((role) => ({
    title: t(`members.role.${role}`),
    key: role,
    align: 'center' as const,
    render: (_: any, record: { permission: EventPermission }) =>
      EVENT_ROLE_PERMISSIONS[role as EventRole].includes(record.permission) ? (
        <CheckOutlined style={{ color: '#52c41a' }} />
      ) : null,
  }));

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder={t('members.search.placeholder')}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={showAddModal}
            style={{
              color: BASE_COLORS.black,
              fontWeight: FONT_WEIGHT.bold,
              backgroundColor: 'var(--primary-color)',
            }}
          >
            {t('members.addMember')}
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => fetchMembers(page, searchText),
          }}
        />
      </Card>

      <Modal
        title={
          editingMember
            ? t('members.modal.editTitle')
            : t('members.modal.addTitle')
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        width={1200}
      >
        <Form form={form} layout="vertical">
          <div style={{ padding: '0 24px' }}>
            {!editingMember && (
              <Form.Item
                name="email"
                label={t('members.form.email')}
                rules={[
                  { required: true, message: t('members.form.emailRequired') },
                  { type: 'email', message: t('members.form.emailInvalid') },
                ]}
              >
                <Input />
              </Form.Item>
            )}
            <Form.Item
              name="role"
              label={t('members.form.role')}
              rules={[
                { required: true, message: t('members.form.roleRequired') },
              ]}
            >
              <Select>
                {Object.entries(EVENT_ROLE_LABELS)
                  .filter(([value]) => {
                    const roleHierarchy = {
                      [EventRole.OWNER]: 5,
                      [EventRole.ADMIN]: 4,
                      [EventRole.MANAGER]: 3,
                      [EventRole.ENTRY_STAFF]: 2,
                      [EventRole.VENDOR]: 1,
                    };

                    return (
                      roleHierarchy[value as EventRole] <
                      roleHierarchy[
                        EventRole[eventBrief!.role] || EventRole.VENDOR
                      ]
                    );
                  })
                  .map(([value, label]) => (
                    <Select.Option key={value} value={value}>
                      {t(`members.role.${value}`)}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Divider>{t('members.permissions.title')}</Divider>
            <div style={{ marginTop: 24 }}>
              <Table
                columns={[
                  {
                    title: t('members.permissions.permission'),
                    dataIndex: 'permission',
                    key: 'permission',
                    width: 200,
                    fixed: 'left',
                    render: (permission: EventPermission) => {
                      const permissionKey = permission.replace(
                        'org:event:',
                        '',
                      );
                      return t(`event.${permissionKey}`);
                    },
                  },
                  ...permissionColumns,
                ]}
                dataSource={Object.entries(EVENT_PERMISSION_LABELS).map(
                  ([permission]) => ({
                    permission,
                  }),
                )}
                rowKey="permission"
                pagination={false}
                scroll={{ x: 1000 }}
                size="small"
              />
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EventMembers;
