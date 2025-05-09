import React, { useMemo, useState } from 'react';
import {
  Modal,
  Box,
  Title,
  Grid,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Paper,
  Select,
  MultiSelect,
  Divider,
  rem,
  useMantineTheme,
  Badge,
} from '@mantine/core';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from '@mantine/form';

// Tiptap rich text editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconH1,
  IconH2,
  IconCalendar,
  IconUser,
  IconTag,
  IconChevronDown,
  IconX,
  IconCheck,
} from '@tabler/icons-react';

import { KanbanTask, TaskAssignment, KanbanColumn } from '@/api/kanban.client';
import { useUpdateKanbanTask } from '@/mutations/useUpdateKanbanTask';
import { useUpdateTaskAssignments } from '@/mutations/useUpdateTaskAssignments';
import { useListMembers } from '@/queries/useMemberQueries';

interface TaskEditModalProps {
  task: KanbanTask;
  eventId: string;
  assignments: TaskAssignment[];
  columns: KanbanColumn[];
  onClose: () => void;
}

interface Option {
  value: string;
  label: string;
}

// Styled toolbar button (reduced size)
interface ToolbarButtonProps {
  icon: React.FC<any>;
  onClick: () => void;
  active?: boolean;
  tooltip?: string;
}

const ToolbarButton: React.FC<{
  icon: React.FC<any>;
  onClick: () => void;
  active?: boolean;
  tooltip?: string;
}> = ({ icon: Icon, onClick, active, tooltip }) => {
  const theme = useMantineTheme();
  return (
    <Button
      variant="subtle"
      size="xs"
      title={tooltip}
      onClick={onClick}
      style={{
        minWidth: rem(28),
        height: rem(28),
        padding: 0,
        backgroundColor: active ? theme.colors.blue[1] : 'transparent',
        color: active ? theme.colors.blue[7] : theme.colors.gray[7],
        border: active ? `1px solid ${theme.colors.blue[3]}` : 'none',
        transition: 'all 0.2s ease',
      }}
      styles={(theme) => ({
        root: {
          '&:hover': {
            backgroundColor: active
              ? theme.colors.blue[2]
              : theme.colors.gray[1],
          },
        },
      })}
    >
      <Icon size={16} stroke={1.5} />
    </Button>
  );
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  eventId,
  assignments,
  columns,
  onClose,
}) => {
  const theme = useMantineTheme();
  const updateTask = useUpdateKanbanTask(eventId);
  const updateTaskAssignments = useUpdateTaskAssignments(eventId);

  // State for title editing
  const [titleEditMode, setTitleEditMode] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const form = useForm({
    initialValues: {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assignees: assignments.map((a) => a.memberId.toString()),
      columnId: task.columnId.toString(),
      priority: task.priority || 'medium',
      labels: task.labels || [],
    },
    validate: { title: (v) => (!v.trim() ? 'Title is required' : null) },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Describe the task...' }),
    ],
    content: form.values.description,
    onUpdate: ({ editor }) =>
      form.setFieldValue('description', editor.getHTML()),
  });

  const { data: md, isLoading: loading } = useListMembers(eventId, {
    page: 1,
    limit: 100,
  } as any);
  const memberOptions: Option[] = useMemo(
    () =>
      md?.docs.map((m) => ({
        value: m.id.toString(),
        label: `${m.firstName} ${m.lastName}`,
      })) || [],
    [md],
  );

  const columnOptions: Option[] = useMemo(
    () => columns.map((c) => ({ value: c.id.toString(), label: c.name })),
    [columns],
  );
  const priorityOptions: Option[] = useMemo(
    () => [
      { value: 'lowest', label: 'Lowest' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'highest', label: 'Highest' },
    ],
    [],
  );

  const getColumnColor = (id: string) => {
    const col = columns.find((c) => c.id.toString() === id);
    const name = col?.name.toLowerCase() || '';
    if (name.includes('todo') || name.includes('backlog')) return 'blue';
    if (name.includes('in progress')) return 'yellow';
    if (name.includes('done')) return 'green';
    if (name.includes('blocked')) return 'red';
    return 'gray';
  };
  const getPriorityColor = (p: string) => {
    if (p === 'highest') return 'red';
    if (p === 'high') return 'orange';
    if (p === 'medium') return 'blue';
    if (p === 'low') return 'green';
    return 'gray';
  };

  // Title editing handlers
  const handleTitleDoubleClick = () => {
    setTempTitle(form.values.title);
    setTitleEditMode(true);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      form.setFieldValue('title', tempTitle);
    }
    setTitleEditMode(false);
  };

  const handleCancelEditTitle = () => {
    setTitleEditMode(false);
  };

  const handleSubmit = async (vals: typeof form.values) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: { ...vals, columnId: parseInt(vals.columnId, 10) },
      });
      const current = assignments.map((a) => a.memberId.toString());
      if (
        vals.assignees.length !== current.length ||
        !vals.assignees.every((id) => current.includes(id))
      ) {
        await updateTaskAssignments.mutateAsync({
          taskId: task.id,
          data: { assignees: vals.assignees },
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      size="xl"
      overlayColor={
        theme.colorScheme === 'dark'
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={4}
      withCloseButton
      styles={{
        modal: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          padding: 0,
        },
        header: {
          display: 'none', // Hide default header
        },
      }}
    >
      {/* Custom header */}
      <Box
        style={{
          backgroundColor: 'white',
          color: theme.black,
          padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: rem(42),
        }}
      >
        {/* Editable Title with double-click functionality */}
        {titleEditMode ? (
          <Box style={{ flexGrow: 1, marginTop: rem(4) }}>
            <TextInput
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              size="md"
              style={{ flexGrow: 1 }}
              autoFocus
              rightSection={
                <Box
                  style={{
                    display: 'flex',
                    gap: 0,
                    justifyContent: 'flex-end',
                    marginRight: 5,
                  }}
                >
                  <Button
                    variant="transparent"
                    color="green"
                    size="xs"
                    onClick={handleSaveTitle}
                    style={{ height: 28, width: 28, padding: 0 }}
                    title="Save title"
                  >
                    <IconCheck size={16} />
                  </Button>
                  <Button
                    variant="transparent"
                    color="red"
                    size="xs"
                    onClick={handleCancelEditTitle}
                    style={{ height: 28, width: 28, padding: 0 }}
                    title="Cancel"
                  >
                    <IconX size={16} />
                  </Button>
                </Box>
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEditTitle();
              }}
            />
          </Box>
        ) : (
          <Title
            order={4}
            style={{ lineHeight: 1, cursor: 'pointer' }}
            onDoubleClick={handleTitleDoubleClick}
          >
            {form.values.title || 'Task Details'}
          </Title>
        )}
        <Button
          variant="subtle"
          color="black"
          size="xs"
          onClick={onClose}
          style={{ padding: rem(4) }}
        >
          <IconX size={18} />
        </Button>
      </Box>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid gutter={16}>
          <Grid.Col
            span={8}
            sx={{
              backgroundColor: theme.white,
              borderRight: `1px solid ${theme.colors.gray[3]}`,
            }}
          >
            <Stack spacing="md">
              <Text weight={500} size="lg">
                Description
              </Text>
              <Paper
                withBorder
                shadow="sm"
                sx={{ borderColor: theme.colors.gray[3] }}
              >
                {/* Toolbar inside editor container */}
                <Paper
                  shadow="xs"
                  p="sm"
                  withBorder={false}
                  style={{
                    borderBottom: `1px solid ${theme.colors.gray[3]}`,
                    backgroundColor: theme.white,
                    borderTopLeftRadius: theme.radius.sm,
                    borderTopRightRadius: theme.radius.sm,
                  }}
                >
                  <Group gap="xs" align="center">
                    <Group gap={0}>
                      <ToolbarButton
                        icon={IconBold}
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                        active={editor?.isActive('bold')}
                        tooltip="Bold"
                      />
                      <ToolbarButton
                        icon={IconItalic}
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                        active={editor?.isActive('italic')}
                        tooltip="Italic"
                      />
                    </Group>

                    <Divider orientation="vertical" mx="xs" />

                    <Group gap={0}>
                      <ToolbarButton
                        icon={IconH1}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        active={editor?.isActive('heading', { level: 1 })}
                        tooltip="Heading 1"
                      />
                      <ToolbarButton
                        icon={IconH2}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        active={editor?.isActive('heading', { level: 2 })}
                        tooltip="Heading 2"
                      />
                    </Group>

                    <Divider orientation="vertical" mx="xs" />

                    <Group gap={0}>
                      <ToolbarButton
                        icon={IconList}
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                        active={editor?.isActive('bulletList')}
                        tooltip="Bullet List"
                      />
                      <ToolbarButton
                        icon={IconListNumbers}
                        onClick={() =>
                          editor?.chain().focus().toggleOrderedList().run()
                        }
                        active={editor?.isActive('orderedList')}
                        tooltip="Numbered List"
                      />
                    </Group>
                  </Group>
                </Paper>
                {/* Editor content */}
                <Box
                  style={{
                    minHeight: rem(240),
                    padding: rem(12),
                    backgroundColor: theme.white,
                    border: `1px solid ${theme.colors.gray[3]}`,
                    borderTop: 'none',
                    borderRadius: `0 0 ${theme.radius.sm} ${theme.radius.sm}`,
                  }}
                >
                  <EditorContent editor={editor} />
                </Box>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={4} sx={{ backgroundColor: theme.colors.gray[0] }}>
            <Stack spacing="lg" sx={{ padding: rem(20) }}>
              <Select
                label="Status"
                data={columnOptions}
                {...form.getInputProps('columnId')}
                rightSection={<IconChevronDown size={16} />}
                variant="default"
                radius="md"
                size="md"
              />
              <Badge
                color={getColumnColor(form.values.columnId)}
                variant="light"
              >
                {
                  columns.find((c) => c.id.toString() === form.values.columnId)
                    ?.name
                }
              </Badge>

              <Select
                label="Priority"
                data={priorityOptions}
                {...form.getInputProps('priority')}
                rightSection={<IconTag size={16} />}
                variant="default"
                radius="md"
                size="md"
              />
              <Badge
                color={getPriorityColor(form.values.priority)}
                variant="light"
              >
                {form.values.priority.charAt(0).toUpperCase() +
                  form.values.priority.slice(1)}
              </Badge>

              <MultiSelect
                label="Labels"
                data={form.values.labels.map((lbl) => ({
                  value: lbl,
                  label: lbl,
                }))}
                creatable
                getCreateLabel={(q) => `+ Create ${q}`}
                onCreate={(q) => ({ value: q.toLowerCase(), label: q })}
                {...form.getInputProps('labels')}
                rightSection={<IconTag size={16} />}
                variant="default"
                radius="md"
                size="md"
              />

              <Stack spacing="sm">
                <Group spacing="xs" align="center">
                  <IconCalendar size={18} />
                  <Text weight={500}>Due Date</Text>
                </Group>
                <ReactDatePicker
                  selected={form.values.dueDate}
                  onChange={(d) => form.setFieldValue('dueDate', d)}
                  dateFormat="MMMM d, yyyy"
                  isClearable
                  className="custom-datepicker"
                  wrapperClassName="custom-datepicker-wrapper"
                />
              </Stack>

              <Stack spacing="sm">
                <Group spacing="xs" align="center">
                  <IconUser size={18} />
                  <Text weight={500}>Assignees</Text>
                </Group>
                <MultiSelect
                  data={memberOptions}
                  searchable
                  clearable
                  {...form.getInputProps('assignees')}
                  variant="default"
                  radius="md"
                  size="md"
                />
                {loading && <Text size="sm">Loading members...</Text>}
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider />
        <Group position="right" spacing="md" sx={{ padding: rem(16) }}>
          <Button variant="outline" color="red" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="blue"
            loading={updateTask.isLoading || updateTaskAssignments.isLoading}
          >
            Save Changes
          </Button>
        </Group>
      </form>

      {/* Additional datepicker CSS */}
      <style>
        {`
          .custom-datepicker-wrapper { width: 100%; }
          .custom-datepicker {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${theme.colors.gray[4]};
            border-radius: ${rem(6)};
            font-size: ${rem(14)};
            background: ${theme.white};
          }
          .custom-datepicker:focus {
            border-color: ${theme.colors.blue[6]};
            outline: none;
          }
        `}
      </style>
    </Modal>
  );
};
