import { useState } from 'react';
import {
  Table,
  Paper,
  Button,
  TextInput,
  Modal,
  Select,
  Divider,
  Text,
  Stack,
  Group,
  Box,
  ActionIcon,
  Badge,
  Center,
  Flex,
  ScrollArea,
  LoadingOverlay,
  Pagination,
  rem,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUserPlus,
  IconCheck,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  EventPermission,
  EVENT_ROLE_PERMISSIONS,
  EVENT_PERMISSION_LABELS,
  EVENT_ROLE_LABELS,
} from './types';
import { useEvent } from '../../../contexts/EventContext';
import { MemberModel } from '@/domain/MemberModel';
import { EventRole } from '@/constants/enums/event';
import { useListMembers, useMemberMutations } from '@/queries/useMemberQueries';
import { ToolBar } from '@/components/common/ToolBar';
import { SearchBarWrapper } from '@/components/common/SearchBar';
import { useFilterQueryParamSync } from '@/hooks/useFilterQueryParamSync';
import { QueryFilters } from '@tanstack/react-query';
import { PageBody } from '@/components/common/PageBody';
import { PageTitle } from '@/components/common/MantinePageTitle';

const EventMembers = () => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const { eventBrief } = useEvent();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingMember, setEditingMember] = useState<MemberModel | null>(null);
  const [searchParams, setSearchParams] = useFilterQueryParamSync();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  // Initialize form with Mantine useForm
  const form = useForm({
    initialValues: {
      email: '',
      role: '',
    },
    validate: {
      email: (value) =>
        !value
          ? t('members.form.emailRequired')
          : !/^\S+@\S+$/.test(value)
          ? t('members.form.emailInvalid')
          : null,
      role: (value) => (!value ? t('members.form.roleRequired') : null),
    },
  });

  // Data fetching with react-query
  const { data, isLoading } = useListMembers(
    eventId!,
    searchParams as QueryFilters,
  );

  const { addMemberMutation, updateMemberRoleMutation, deleteMemberMutation } =
    useMemberMutations(eventId!);

  const members = data?.docs || [];
  const totalDocs = data?.totalDocs || 0;

  // Event handlers
  const showAddModal = () => {
    form.reset();
    setEditingMember(null);
    openModal();
  };

  const showEditModal = (member: MemberModel) => {
    setEditingMember(member);
    form.setValues({ role: member.role });
    openModal();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ ...searchParams, page: newPage.toString() });
  };

  const handleModalSubmit = async (values: typeof form.values) => {
    if (!eventBrief) return;

    try {
      if (editingMember) {
        await updateMemberRoleMutation.mutateAsync({
          userId: editingMember.userId,
          data: { role: values.role as EventRole },
        });
        notifications.show({
          title: t('members.update.success'),
          message: '',
          color: 'green',
        });
      } else {
        await addMemberMutation.mutateAsync({
          email: values.email,
          role: values.role as EventRole,
          organizationId: eventBrief.organizationId!,
        });
        notifications.show({
          title: t('members.add.success'),
          message: '',
          color: 'green',
        });
      }
      closeModal();
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

      notifications.show({
        title: t('common.error'),
        message: description,
        color: 'red',
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!eventBrief) return;

    try {
      await deleteMemberMutation.mutateAsync(userId);
      notifications.show({
        title: t('members.delete.success'),
        message: '',
        color: 'green',
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
          description = t('members.delete.error');
      }

      notifications.show({
        title: t('common.error'),
        message: description,
        color: 'red',
      });
    }
  };

  // UI Component renderers
  const renderMemberInfo = (member: MemberModel) => (
    <Stack gap={0}>
      <Text fw={500}>{`${member.firstName} ${member.lastName}`}</Text>
      <Text size="sm" c="dimmed">
        {member.email}
      </Text>
    </Stack>
  );

  const renderRole = (role: EventRole) => (
    <Badge color="blue" variant="light">
      {t(`members.role.${role}`)}
    </Badge>
  );

  const renderActions = (member: MemberModel) => (
    <Group justify="center" gap="xs">
      <ActionIcon
        variant="light"
        color="blue"
        onClick={() => showEditModal(member)}
      >
        <IconEdit style={{ width: rem(16), height: rem(16) }} />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="red"
        onClick={() => handleDelete(member.userId)}
      >
        <IconTrash style={{ width: rem(16), height: rem(16) }} />
      </ActionIcon>
    </Group>
  );

  // Helper function to check if a role has a specific permission
  const hasPermission = (
    role: string,
    permission: EventPermission,
  ): boolean => {
    // Safely cast the role string to EventRole enum
    const roleEnum = role as unknown as EventRole;
    return EVENT_ROLE_PERMISSIONS[roleEnum].includes(permission);
  };

  return (
    <Box p={24}>
      <PageBody>
        <PageTitle>Members</PageTitle>

        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t`Search by name, email...`}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
            />
          )}
        >
          <Button
            color="blue"
            leftSection={<IconUserPlus size={16} />}
            onClick={showAddModal}
            radius="md"
          >
            {t('members.addMember')}
          </Button>
        </ToolBar>

        <Paper shadow="xs" radius="md" p="md" withBorder>
          <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('members.table.member')}</Table.Th>
                <Table.Th>{t('members.table.role')}</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>
                  {t('members.table.actions')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Center p="xl">
                      <Text c="dimmed" fs="italic">
                        {t('common.noResults')}
                      </Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                members.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>{renderMemberInfo(member)}</Table.Td>
                    <Table.Td>{renderRole(member.role)}</Table.Td>
                    <Table.Td>{renderActions(member)}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>

          {totalDocs > pageSize && (
            <Flex justify="center" mt="md">
              <Pagination
                value={page}
                onChange={handlePageChange}
                total={Math.ceil(totalDocs / pageSize)}
              />
            </Flex>
          )}
        </Paper>

        <Modal
          opened={modalOpened}
          onClose={closeModal}
          title={
            <Text fw={600} size="lg">
              {editingMember
                ? t('members.modal.editTitle')
                : t('members.modal.addTitle')}
            </Text>
          }
          size="xl"
          centered
        >
          <form onSubmit={form.onSubmit(handleModalSubmit)}>
            <Stack p="md">
              {!editingMember && (
                <TextInput
                  required
                  label={t('members.form.email')}
                  placeholder="email@example.com"
                  {...form.getInputProps('email')}
                />
              )}

              <Select
                required
                label={t('members.form.role')}
                placeholder="Select a role"
                data={Object.entries(EVENT_ROLE_LABELS)
                  .filter(([value]) => {
                    const roleHierarchy = {
                      [EventRole.OWNER]: 5,
                      [EventRole.ADMIN]: 4,
                      [EventRole.MANAGER]: 3,
                      [EventRole.ENTRY_STAFF]: 2,
                      [EventRole.VENDOR]: 1,
                    };

                    // Convert string to EventRole enum for comparison
                    const valueRole = value as unknown as EventRole;
                    const currentRole =
                      (eventBrief?.role as unknown as EventRole) ||
                      EventRole.VENDOR;

                    return (
                      roleHierarchy[valueRole] < roleHierarchy[currentRole]
                    );
                  })
                  .map(([value]) => ({
                    value,
                    label: t(`members.role.${value}`),
                  }))}
                {...form.getInputProps('role')}
              />

              <Divider
                label={<Text fw={500}>{t('members.permissions.title')}</Text>}
                labelPosition="center"
                my="md"
              />

              <ScrollArea h={300}>
                <Table withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ whiteSpace: 'nowrap' }}>
                        {t('members.permissions.permission')}
                      </Table.Th>
                      {Object.keys(EVENT_ROLE_LABELS).map((role) => (
                        <Table.Th key={role} style={{ textAlign: 'center' }}>
                          {t(`members.role.${role}`)}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(EVENT_PERMISSION_LABELS).map(
                      ([permission]) => (
                        <Table.Tr key={permission}>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>
                            {t(`event.${permission.replace('org:event:', '')}`)}
                          </Table.Td>
                          {Object.keys(EVENT_ROLE_LABELS).map((role) => (
                            <Table.Td
                              key={role}
                              style={{ textAlign: 'center' }}
                            >
                              {hasPermission(
                                role,
                                permission as EventPermission,
                              ) ? (
                                <Center>
                                  <IconCheck
                                    style={{
                                      color: 'var(--mantine-color-green-6)',
                                    }}
                                  />
                                </Center>
                              ) : null}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      ),
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Flex justify="flex-end" gap="md" mt="md">
                <Button variant="outline" onClick={closeModal}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={
                    addMemberMutation.isPending ||
                    updateMemberRoleMutation.isPending
                  }
                >
                  {t('common.save')}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Modal>
      </PageBody>
    </Box>
  );
};

export default EventMembers;
