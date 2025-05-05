import React from 'react';
import {
  Table,
  Text,
  Group,
  Badge,
  Card,
  Select,
  Stack,
  Image,
  Button,
  Modal,
  Paper,
  SegmentedControl,
  TextInput,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetFacebookPages } from '@/queries/useGetFacebookPages';
import { useGetFacebookPosts } from '@/queries/useGetFacebookPosts';
import { useCheckFacebookAuth } from '@/queries/useCheckFacebookAuth';
import { useDisconnectFacebook } from '@/mutations/useDisconnectFacebook';
import { useUser } from '@clerk/clerk-react';
import {
  IconBrandFacebook,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface PostPreview {
  message: string;
  imageUrls: string[];
  scheduledAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export const FacebookPostsTable: React.FC = () => {
  const { eventId } = useParams();
  const { user } = useUser();
  const [selectedPage, setSelectedPage] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = React.useState('date');
  const [previewPost, setPreviewPost] = React.useState<PostPreview | null>(
    null,
  );
  const { data: authStatus } = useCheckFacebookAuth(user?.id || '');
  const { data: facebookPages } = useGetFacebookPages(eventId);

  const { data: posts, isLoading } = useGetFacebookPosts(eventId, selectedPage);
  const disconnectMutation = useDisconnectFacebook();

  console.log(posts);
  if (!user) {
    return (
      <Card withBorder>
        <Stack gap="md" align="center" py="xl">
          <Text c="dimmed" ta="center">
            Please sign in to manage Facebook posts
          </Text>
        </Stack>
      </Card>
    );
  }

  if (!authStatus?.isAuthenticated) {
    return (
      <Card withBorder>
        <Stack gap="md" align="center" py="xl">
          <Text size="lg" fw={500}>
            Connect to Facebook
          </Text>
          <Text c="dimmed" ta="center">
            Please connect your Facebook account to view and manage your posts
          </Text>
          <Button
            leftSection={<IconBrandFacebook size={16} />}
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_API_BASE_URL
              }/event/auth/facebook?state=${eventId}&userId=${user?.id}`;
            }}
            variant="filled"
            color="blue"
          >
            Connect with Facebook
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Facebook Post Statistics
          </Text>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconBrandFacebook size={16} />}
            onClick={async () => {
              try {
                await disconnectMutation.mutateAsync(user?.id || '');
                notifications.show({
                  title: 'Success',
                  message: 'Disconnected from Facebook',
                  color: 'green',
                });
              } catch (error) {
                notifications.show({
                  title: 'Error',
                  message: 'Failed to disconnect from Facebook',
                  color: 'red',
                });
              }
            }}
            loading={disconnectMutation.isPending}
          >
            Disconnect Facebook
          </Button>
          <Select
            placeholder="Select Facebook Page"
            data={
              facebookPages?.data?.result?.map((page) => ({
                value: page.id,
                label: page.name,
              })) || []
            }
            value={selectedPage}
            onChange={setSelectedPage}
            style={{ width: 250 }}
          />
        </Group>

        <Group gap="sm">
          <TextInput
            placeholder="Search posts..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <SegmentedControl
            value={sortBy}
            onChange={setSortBy}
            data={[
              { label: 'Date', value: 'date' },
              { label: 'Likes', value: 'likes' },
              { label: 'Comments', value: 'comments' },
              { label: 'Shares', value: 'shares' },
            ]}
          />
          <Button
            variant="subtle"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            leftSection={
              sortOrder === 'asc' ? (
                <IconSortAscending size={16} />
              ) : (
                <IconSortDescending size={16} />
              )
            }
          >
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </Group>

        {posts && posts.length > 0 && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Post Preview</Table.Th>
                <Table.Th>Scheduled For</Table.Th>
                <Table.Th>Engagement</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {posts
                ?.filter((post) =>
                  post.message.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .sort((a, b) => {
                  if (sortBy === 'date') {
                    return sortOrder === 'asc'
                      ? new Date(a.scheduledAt).getTime() -
                          new Date(b.scheduledAt).getTime()
                      : new Date(b.scheduledAt).getTime() -
                          new Date(a.scheduledAt).getTime();
                  }
                  return sortOrder === 'asc'
                    ? a[sortBy] - b[sortBy]
                    : b[sortBy] - a[sortBy];
                })
                .map((post) => (
                  <Table.Tr
                    key={post.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPreviewPost(post)}
                  >
                    <Table.Td style={{ maxWidth: '300px' }}>
                      <Stack gap="xs">
                        <Text size="sm" lineClamp={3}>
                          {post.message}
                        </Text>
                        {post.imageUrls?.length > 0 && (
                          <Group gap="xs">
                            {post.imageUrls.slice(0, 3).map((url, index) => (
                              <Image
                                key={index}
                                src={url}
                                w={60}
                                h={60}
                                radius="sm"
                                fit="cover"
                              />
                            ))}
                            {post.imageUrls.length > 3 && (
                              <Badge>+{post.imageUrls.length - 3} more</Badge>
                            )}
                          </Group>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {dayjs(post.scheduledAt).format('MMM D, YYYY h:mm A')}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Text size="sm">👍 {post.likes} likes</Text>
                        <Text size="sm">💬 {post.comments} comments</Text>
                        <Text size="sm">🔄 {post.shares} shares</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          dayjs(post.scheduledAt).isAfter(dayjs())
                            ? 'yellow'
                            : 'green'
                        }
                      >
                        {dayjs(post.scheduledAt).isAfter(dayjs())
                          ? 'Scheduled'
                          : 'Published'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              {!isLoading && (!posts || posts.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      {selectedPage
                        ? 'No posts found for this page'
                        : 'Select a page to view posts'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}

        <Modal
          opened={!!previewPost}
          onClose={() => setPreviewPost(null)}
          size="xl"
          title="Post Preview"
        >
          {previewPost && (
            <Paper p="md">
              <Stack gap="md">
                <Text size="lg">{previewPost.message}</Text>
                {previewPost.imageUrls?.length > 0 && (
                  <Group gap="md">
                    {previewPost.imageUrls.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        radius="md"
                        fit="cover"
                        h={200}
                      />
                    ))}
                  </Group>
                )}
                <Group gap="xl">
                  <Text>
                    Scheduled for:{' '}
                    {dayjs(previewPost.scheduledAt).format(
                      'MMM D, YYYY h:mm A',
                    )}
                  </Text>
                  <Group gap="lg">
                    <Text>👍 {previewPost.likes} likes</Text>
                    <Text>💬 {previewPost.comments} comments</Text>
                    <Text>🔄 {previewPost.shares} shares</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          )}
        </Modal>
      </Stack>
    </Card>
  );
};
