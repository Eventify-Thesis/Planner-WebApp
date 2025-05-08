import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  MultiSelect,
  Select,
  Box,
  Paper,
  Text,
  Badge,
  Divider,
  Title,
  Grid,
} from '@mantine/core';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from '@mantine/form';

// Rich text editor imports
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
  IconH3,
} from '@tabler/icons-react';

import {
  KanbanTask,
  TaskAssignment,
  KanbanColumn,
  TaskPriority,
  TaskLabel,
} from '@/api/kanban.client';
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

interface MemberOption {
  value: string; // For MultiSelect compatibility
  label: string;
  description: string;
}

// Rich text editor menu button component
const MenuButton = ({ icon: Icon, onClick, isActive = false }) => (
  <Button
    variant={isActive ? 'filled' : 'subtle'}
    size="xs"
    p={6}
    onClick={onClick}
    sx={{ height: 30, width: 30, padding: 0 }}
  >
    <Icon size={18} />
  </Button>
);

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  eventId,
  assignments,
  columns,
  onClose,
}) => {
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);

  const updateTask = useUpdateKanbanTask(eventId);
  const updateTaskAssignments = useUpdateTaskAssignments(eventId);

  // Rich text editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add a description...',
      }),
    ],
    content: task.description || '',
    onUpdate: ({ editor }) => {
      form.setFieldValue('description', editor.getHTML());
    },
  });

  // Form setup
  const form = useForm({
    initialValues: {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assignees: assignments.map((assignment) => assignment.memberId),
      columnId: task.columnId,
      priority: task.priority || 'medium',
      labels: task.labels || [],
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
    },
  });

  // Load members using the proper query hook
  const { data: membersData, isLoading: isLoadingMembers } = useListMembers(
    eventId,
    { page: 1, limit: 100 } as any,
  );

  // Update member options when data changes
  useEffect(() => {
    if (membersData?.docs) {
      const options = membersData.docs.map((member) => ({
        value: String(member.id),
        label: `${member.firstName} ${member.lastName}`,
        description: member.email,
      }));
      setMemberOptions(options);
    }
  }, [membersData]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Update task details
      await updateTask.mutateAsync({
        taskId: task.id,
        data: {
          title: values.title,
          description: values.description,
          dueDate: values.dueDate,
          columnId: values.columnId,
          priority: values.priority,
          labels: values.labels,
        },
      });

      // Update task assignments if changed
      const currentAssignees = assignments.map((a) => a.memberId);
      const newAssignees = values.assignees || [];

      if (
        newAssignees.length !== currentAssignees.length ||
        !newAssignees.every((id) => currentAssignees.includes(id))
      ) {
        await updateTaskAssignments.mutateAsync({
          taskId: task.id,
          data: { assignees: newAssignees },
        });
      }

      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Prepare column options for select dropdown
  const columnOptions = useMemo(() => {
    return columns.map((column) => ({
      value: column.id.toString(),
      label: column.name,
    }));
  }, [columns]);

  // Function to get column color by column name
  const getColumnColor = (columnId: number) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) return 'blue';

    const name = column.name.toLowerCase();
    if (
      name.includes('to do') ||
      name.includes('todo') ||
      name.includes('backlog')
    ) {
      return 'blue';
    } else if (name.includes('in progress') || name.includes('doing')) {
      return 'yellow';
    } else if (name.includes('done') || name.includes('completed')) {
      return 'green';
    } else if (name.includes('blocked') || name.includes('impediment')) {
      return 'red';
    }
    return 'gray';
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={<Title order={3}>Task Details</Title>}
      size="lg"
      centered
      styles={{
        body: { padding: '20px' },
        header: { borderBottom: '1px solid #eaeaea', padding: '15px 20px' },
      }}
      trapFocus
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Grid>
            <Grid.Col span={8}>
              <TextInput
                label="Title"
                placeholder="Task title"
                required
                size="md"
                {...form.getInputProps('title')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="Status"
                placeholder="Select status"
                data={columnOptions}
                value={form.values.columnId.toString()}
                onChange={(value) =>
                  form.setFieldValue('columnId', parseInt(value || '0'))
                }
                size="md"
              />
              <Badge
                color={getColumnColor(form.values.columnId)}
                size="lg"
                mt={5}
                variant="light"
                fullWidth
              >
                {columns.find((col) => col.id === form.values.columnId)?.name ||
                  'Unknown'}
              </Badge>
            </Grid.Col>
          </Grid>

          <Grid mt="md">
            <Grid.Col span={6}>
              <Select
                label="Priority"
                placeholder="Select priority"
                data={[
                  { value: 'lowest', label: 'Lowest' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'highest', label: 'Highest' },
                ]}
                value={form.values.priority}
                onChange={(value) =>
                  form.setFieldValue('priority', value || 'medium')
                }
                size="md"
              />
              <Badge
                color={
                  form.values.priority === 'highest'
                    ? 'red'
                    : form.values.priority === 'high'
                    ? 'orange'
                    : form.values.priority === 'medium'
                    ? 'blue'
                    : form.values.priority === 'low'
                    ? 'green'
                    : 'gray'
                }
                size="lg"
                mt={5}
                variant="light"
                fullWidth
              >
                {form.values.priority.charAt(0).toUpperCase() +
                  form.values.priority.slice(1)}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <MultiSelect
                label="Labels"
                placeholder="Add labels"
                data={[
                  { value: 'bug', label: 'Bug' },
                  { value: 'feature', label: 'Feature' },
                  { value: 'task', label: 'Task' },
                  { value: 'improvement', label: 'Improvement' },
                  { value: 'documentation', label: 'Documentation' },
                ]}
                clearable
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = { value: query.toLowerCase(), label: query };
                  return item;
                }}
                value={form.values.labels}
                onChange={(value) => form.setFieldValue('labels', value)}
                size="md"
              />
            </Grid.Col>
          </Grid>

          <Text weight={500} size="sm" mb={5} mt={10}>
            Description
          </Text>
          <Paper withBorder p="xs" style={{ borderRadius: '4px' }}>
            <Group spacing={5} mb={10}>
              <MenuButton
                icon={IconBold}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
              />
              <MenuButton
                icon={IconItalic}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
              />
              <Divider orientation="vertical" mx={5} />
              <MenuButton
                icon={IconH1}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor?.isActive('heading', { level: 1 })}
              />
              <MenuButton
                icon={IconH2}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor?.isActive('heading', { level: 2 })}
              />
              <Divider orientation="vertical" mx={5} />
              <MenuButton
                icon={IconList}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
              />
              <MenuButton
                icon={IconListNumbers}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                isActive={editor?.isActive('orderedList')}
              />
            </Group>
            <Box
              sx={{
                minHeight: '200px',
                '.ProseMirror': {
                  outline: 'none',
                  minHeight: '180px',
                },
              }}
            >
              <EditorContent editor={editor} />
            </Box>
          </Paper>

          <Text weight={500} size="sm" mb={5}>
            Due Date
          </Text>
          <Box mb={10}>
            <ReactDatePicker
              selected={form.values.dueDate}
              onChange={(date) => form.setFieldValue('dueDate', date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select a due date (optional)"
              isClearable
              className="custom-datepicker"
              wrapperClassName="custom-datepicker-wrapper"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Box>

          <style jsx global>{`
            .custom-datepicker-wrapper {
              width: 100%;
            }
            .custom-datepicker {
              width: 100%;
              padding: 10px 14px;
              border: 1px solid #ced4da;
              border-radius: 4px;
              font-size: 14px;
              transition: border-color 0.15s ease-in-out;
            }
            .custom-datepicker:focus {
              border-color: #339af0;
              outline: none;
            }
          `}</style>

          <Text weight={500} size="sm">
            Assignees
          </Text>
          <Box mb={5}>
            <MultiSelect
              placeholder="Select team members to assign"
              data={memberOptions}
              searchable
              clearable
              value={form.values.assignees}
              onChange={(value) => form.setFieldValue('assignees', value)}
              withinPortal
              styles={{
                input: { padding: '10px 14px' },
              }}
            />
            {isLoadingMembers && (
              <Text color="dimmed" size="sm" mt={5}>
                Loading members...
              </Text>
            )}
          </Box>

          <Divider my="md" />

          <Group position="right" spacing="md" mt="lg">
            <Button variant="subtle" onClick={onClose} size="md">
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              loading={updateTask.isPending || updateTaskAssignments.isPending}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
