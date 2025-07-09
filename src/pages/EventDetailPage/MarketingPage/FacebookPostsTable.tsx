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
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetFacebookPages } from '@/queries/useGetFacebookPages';
import {
  useGetFacebookPosts,
  FacebookPost,
} from '@/queries/useGetFacebookPosts';
import { useCheckFacebookAuth } from '@/queries/useCheckFacebookAuth';
import { useDisconnectFacebook } from '@/mutations/useDisconnectFacebook';
import { useUser } from '@clerk/clerk-react';
import {
  IconBrandFacebook,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconExternalLink,
  IconEye,
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

type SortableField = 'date' | 'likes' | 'comments' | 'shares';

export const FacebookPostsTable: React.FC = () => {
  const { eventId } = useParams();
  const { user } = useUser();
  const [selectedPage, setSelectedPage] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = React.useState<SortableField>('date');
  const [previewPost, setPreviewPost] = React.useState<PostPreview | null>(
    null,
  );
  const { data: authStatus } = useCheckFacebookAuth(user?.id || '');
  const { data: facebookPages } = useGetFacebookPages(eventId);

  const { data: posts, isLoading } = useGetFacebookPosts(eventId, selectedPage);
  const disconnectMutation = useDisconnectFacebook();

  const generateFacebookPostUrl = (pageId: string, postId: string): string => {
    // Facebook post URLs typically follow: https://www.facebook.com/{pageId}/posts/{postId}
    // However, postId from Facebook API might be in format {pageId}_{postUniqueId}
    // So we need to extract the unique part if it includes pageId
    const postUniqueId = postId.includes('_') ? postId.split('_')[1] : postId;
    return `https://www.facebook.com/${pageId}/posts/${postUniqueId}`;
  };

  const handleViewPost = (post: FacebookPost) => {
    const postUrl = generateFacebookPostUrl(post.pageId, post.postId);
    window.open(postUrl, '_blank');
  };

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

  const getSortValue = (
    post: FacebookPost,
    sortField: SortableField,
  ): number => {
    switch (sortField) {
      case 'date':
        return new Date(post.scheduledAt).getTime();
      case 'likes':
        return post.likes;
      case 'comments':
        return post.comments;
      case 'shares':
        return post.shares;
      default:
        return 0;
    }
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Facebook Post Statistics
          </Text>
          <Group gap="sm">
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
            onChange={(value) => setSortBy(value as SortableField)}
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
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Post Preview</Table.Th>
                <Table.Th>Scheduled For</Table.Th>
                <Table.Th>Engagement</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {posts
                ?.filter((post) =>
                  post.message.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .sort((a, b) => {
                  const aValue = getSortValue(a, sortBy);
                  const bValue = getSortValue(b, sortBy);
                  return sortOrder === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
                })
                .map((post) => (
                  <Table.Tr key={post.id}>
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
                              <Badge variant="light" color="blue">
                                +{post.imageUrls.length - 3} more
                              </Badge>
                            )}
                          </Group>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {dayjs(post.scheduledAt).format('MMM D, YYYY')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(post.scheduledAt).format('h:mm A')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" c="blue">
                          👍 {post.likes} likes
                        </Text>
                        <Text size="sm" c="green">
                          💬 {post.comments} comments
                        </Text>
                        <Text size="sm" c="orange">
                          🔄 {post.shares} shares
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        color={
                          dayjs(post.scheduledAt).isAfter(dayjs())
                            ? 'yellow'
                            : 'green'
                        }
                        variant="light"
                      >
                        {dayjs(post.scheduledAt).isAfter(dayjs())
                          ? 'Scheduled'
                          : 'Published'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View post preview">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => setPreviewPost(post)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="View on Facebook">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleViewPost(post)}
                          >
                            <IconExternalLink size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              {!isLoading && (!posts || posts.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
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
          title={
            <Group>
              <IconBrandFacebook size={20} color="#1877F2" />
              <Text fw={500}>Post Preview</Text>
            </Group>
          }
        >
          {previewPost && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text size="lg" style={{ lineHeight: 1.6 }}>
                  {previewPost.message}
                </Text>
                {previewPost.imageUrls?.length > 0 && (
                  <Group gap="md">
                    {previewPost.imageUrls.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        radius="md"
                        fit="cover"
                        h={200}
                        style={{ flex: 1 }}
                      />
                    ))}
                  </Group>
                )}
                <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed">
                    Scheduled for:{' '}
                    <Text component="span" fw={500}>
                      {dayjs(previewPost.scheduledAt).format(
                        'MMM D, YYYY h:mm A',
                      )}
                    </Text>
                  </Text>
                  <Group gap="xl">
                    <Text size="sm" c="blue">
                      👍 {previewPost.likes} likes
                    </Text>
                    <Text size="sm" c="green">
                      💬 {previewPost.comments} comments
                    </Text>
                    <Text size="sm" c="orange">
                      🔄 {previewPost.shares} shares
                    </Text>
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
