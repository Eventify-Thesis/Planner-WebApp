import React, { useState } from 'react';
import './MarketingPage.css';
import { useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Select,
  Modal,
  Textarea,
  Box,
  Tabs,
  Paper,
  Title,
  Badge,
  Center,
  ThemeIcon,
  Divider,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useForm } from '@mantine/form';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';

import {
  IconBrandFacebook,
  IconWand,
  IconCheck,
  IconX,
  IconExternalLink,
  IconCopy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGetEventDetail } from '@/queries/useGetEventDetail';
import { useGeneratePost } from '@/mutations/useGeneratePost';
import { useGetFacebookPages } from '@/queries/useGetFacebookPages';
import { useSchedulePost } from '@/mutations/useSchedulePost';
import {
  GeneratePostVariables,
  SchedulePostVariables,
} from '@/api/marketing.client';
import { useUser } from '@clerk/clerk-react';
import { convert } from 'html-to-text';
import { FacebookPostsTable } from './FacebookPostsTable';
import { PageBody } from '@/components/common/PageBody';
import { PageTitle } from '@/components/common/MantinePageTitle';

interface MarketingForm {
  content: string;
  scheduledTime: Date | null;
  customPrompt: string;
  isScheduled: boolean;
}

const MarketingPage: React.FC = () => {
  const { eventId } = useParams();
  const { user } = useUser();
  const { data: eventDetail } = useGetEventDetail(eventId);
  const { data: facebookPages, refetch } = useGetFacebookPages(eventId);
  const generatePost = useGeneratePost();
  const schedulePost = useSchedulePost();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Handle Facebook auth callback
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');

    if (success === 'true') {
      // Fetch pages after successful auth
      refetch();
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'post-image',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    ],
    content: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<{
    link: string;
    success: boolean;
  } | null>(null);

  const form = useForm<MarketingForm>({
    initialValues: {
      content: '',
      scheduledTime: null,
      customPrompt: '',
      isScheduled: true,
    },
  });

  const handleGeneratePost = async () => {
    if (!eventDetail) return;
    setIsGenerating(true);

    setIsError(false);
    try {
      const variables: GeneratePostVariables = {
        eventId,
        data: {
          eventName: eventDetail.eventName || '',
          eventDescription: eventDetail.eventDescription || '',
          eventType: eventDetail.eventType || '',
          orgName: eventDetail.orgName || '',
          orgDescription: eventDetail.orgDescription,
          orgLogoUrl: eventDetail.orgLogoUrl,
          eventLogoUrl: eventDetail.eventLogoUrl,
          eventBannerUrl: eventDetail.eventBannerUrl,
          venueName: eventDetail.venueName,
          street: eventDetail.street,
          categories: eventDetail.categories,
          date: new Date().toISOString(),
          customPrompt: form.values.customPrompt,
        },
      };

      const data = await generatePost.mutateAsync(variables);
      const content = data.data.result;
      setGeneratedContent(content);
    } catch (error) {
      setIsError(true);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate post content',
        color: 'red',
      });
    }
  };

  const handleSchedulePost = async () => {
    if (!selectedPage || !facebookPages?.data?.result?.length) {
      notifications.show({
        title: 'Error',
        message: 'Please select a page and connect to Facebook first',
        color: 'red',
      });
      return;
    }

    setIsPosting(true);

    try {
      if (
        !selectedPage ||
        !editor?.getHTML() ||
        (form.values.isScheduled && !form.values.scheduledTime)
      ) {
        notifications.show({
          title: 'Error',
          message: 'Please fill in all required fields',
          color: 'red',
        });
        setIsPosting(false);
        return;
      }

      // Extract image URLs from the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.getHTML();
      const imageUrls = Array.from(tempDiv.getElementsByTagName('img'))
        .map((img) => (img instanceof HTMLImageElement ? img.src : null))
        .filter((url): url is string => url !== null);

      const variables: SchedulePostVariables = {
        eventId: eventId!,
        data: {
          pageId: selectedPage,
          content: convert(editor.getHTML(), {
            wordwrap: 130,
            selectors: [
              { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
              { selector: 'img', format: 'skip' },
            ],
          }),
          scheduledTime:
            form.values.isScheduled && form.values.scheduledTime
              ? form.values.scheduledTime.toISOString()
              : new Date().toISOString(),
          imageUrls,
        },
      };

      const result = await schedulePost.mutateAsync(variables);

      console.log(result);

      // Show success modal with post link
      const isSuccess = result?.data?.success === true;
      const postId = result?.data?.data?.id;

      setPostResult({
        link: postId ? `https://www.facebook.com/${postId}` : '#',
        success: isSuccess,
      });

      notifications.show({
        title: 'Success',
        message: 'Post scheduled successfully',
        color: 'green',
      });
    } catch (error) {
      setPostResult({
        link: '',
        success: false,
      });
      notifications.show({
        title: 'Error',
        message: 'Failed to schedule post',
        color: 'red',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
      <PageBody>
        <PageTitle>Facebook Marketing</PageTitle>
        <Stack gap="md">
          <Tabs defaultValue="posts">
            <Tabs.List>
              <Tabs.Tab
                value="posts"
                leftSection={<IconBrandFacebook size={16} />}
              >
                Facebook Posts
              </Tabs.Tab>
              <Tabs.Tab value="create" leftSection={<IconWand size={16} />}>
                Create Post
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="posts" pt="md">
              <FacebookPostsTable />
            </Tabs.Panel>

            <Tabs.Panel value="create" pt="md">
              <Card withBorder shadow="sm" radius="md">
                <Stack gap="lg">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs">
                      <Title order={4} c="blue">
                        🤖 AI Post Generator
                      </Title>
                      <Text size="sm" c="dimmed">
                        Let AI create engaging Facebook posts for your event
                      </Text>
                    </Stack>
                    <Button
                      leftSection={<IconWand size={16} />}
                      onClick={handleGeneratePost}
                      loading={generatePost.isPending}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      Generate Post
                    </Button>
                  </Group>
                  <Textarea
                    label="Custom Generation Prompt (Optional)"
                    description="Provide additional instructions for the AI to customize your post"
                    placeholder="Example: Make it more casual and fun, or focus on the networking opportunities"
                    {...form.getInputProps('customPrompt')}
                    minRows={3}
                  />
                  <RichTextEditor editor={editor}>
                    <RichTextEditor.Toolbar sticky stickyOffset={60}>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignRight />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                      </RichTextEditor.ControlsGroup>

                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignRight />
                      </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>

                    <RichTextEditor.Content
                      {...form.getInputProps('content')}
                      style={{ minHeight: '200px' }}
                    />
                  </RichTextEditor>
                </Stack>
              </Card>

              <Card withBorder mt="md" shadow="sm" radius="md">
                <Stack gap="lg">
                  <Stack gap="xs">
                    <Title order={4} c="green">
                      📅 Schedule & Publish
                    </Title>
                    <Text size="sm" c="dimmed">
                      Connect to Facebook and schedule or publish your post
                    </Text>
                  </Stack>
                  {!facebookPages?.data?.result?.length && user?.id ? (
                    <Paper withBorder p="lg" radius="md" bg="blue.0">
                      <Stack gap="md" align="center">
                        <ThemeIcon
                          size={50}
                          radius="xl"
                          color="blue"
                          variant="light"
                        >
                          <IconBrandFacebook size={28} />
                        </ThemeIcon>
                        <Stack gap="xs" align="center">
                          <Text fw={500} ta="center">
                            Connect Your Facebook Account
                          </Text>
                          <Text size="sm" c="dimmed" ta="center">
                            Connect to Facebook to schedule and publish posts to
                            your pages
                          </Text>
                        </Stack>
                        <Button
                          leftSection={<IconBrandFacebook size={16} />}
                          onClick={() => {
                            window.location.href = `${
                              import.meta.env.VITE_API_BASE_URL
                            }/event/auth/facebook?state=${eventId}&userId=${
                              user?.id
                            }`;
                          }}
                          variant="gradient"
                          gradient={{ from: 'blue', to: 'indigo' }}
                          size="md"
                        >
                          Connect with Facebook
                        </Button>
                      </Stack>
                    </Paper>
                  ) : (
                    <>
                      <Group justify="space-between">
                        <Text>Connected to Facebook</Text>
                        <Button
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            setSelectedPage(null);
                            refetch();
                          }}
                        >
                          Disconnect
                        </Button>
                      </Group>
                      <Select
                        label="Select Facebook Page"
                        placeholder="Choose a page to post to"
                        data={
                          facebookPages?.data?.result?.map((page) => ({
                            value: page.id,
                            label: page.name,
                          })) || []
                        }
                        value={selectedPage}
                        onChange={setSelectedPage}
                      />
                      <Group grow>
                        <Select
                          label="Post Type"
                          value={
                            form.values.isScheduled ? 'scheduled' : 'immediate'
                          }
                          onChange={(value) =>
                            form.setFieldValue(
                              'isScheduled',
                              value === 'scheduled',
                            )
                          }
                          data={[
                            { value: 'scheduled', label: 'Schedule for Later' },
                            { value: 'immediate', label: 'Post Immediately' },
                          ]}
                        />
                      </Group>
                      {form.values.isScheduled && (
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="Pick date and time"
                          style={{ width: '100%' }}
                          value={
                            form.values.scheduledTime
                              ? dayjs(form.values.scheduledTime)
                              : null
                          }
                          onChange={(date) =>
                            form.setFieldValue(
                              'scheduledTime',
                              date?.toDate() || null,
                            )
                          }
                          disabledDate={(current) =>
                            current && current < dayjs().startOf('day')
                          }
                        />
                      )}
                      <Button
                        leftSection={<IconBrandFacebook size={16} />}
                        onClick={handleSchedulePost}
                        variant="light"
                        color="blue"
                        loading={isPosting}
                        disabled={
                          !selectedPage ||
                          !editor?.getHTML() ||
                          (form.values.isScheduled &&
                            !form.values.scheduledTime) ||
                          isPosting
                        }
                      >
                        {isPosting
                          ? 'Posting...'
                          : form.values.isScheduled
                          ? 'Schedule Post'
                          : 'Post Now'}
                      </Button>
                    </>
                  )}
                </Stack>
              </Card>
            </Tabs.Panel>
          </Tabs>
          <Modal
            opened={isGenerating}
            onClose={() => setIsGenerating(false)}
            title="Generating Post Content"
            size="xl"
          >
            <Stack gap="md">
              {generatedContent ? (
                <Box>
                  <Tabs defaultValue="preview">
                    <Tabs.List>
                      <Tabs.Tab value="preview">Preview</Tabs.Tab>
                      <Tabs.Tab value="raw">Raw Content</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="preview">
                      <Paper p="md" withBorder mt="xs">
                        <div
                          dangerouslySetInnerHTML={{ __html: generatedContent }}
                        />
                      </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="raw">
                      <Paper p="md" withBorder mt="xs">
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                          {generatedContent}
                        </pre>
                      </Paper>
                    </Tabs.Panel>
                  </Tabs>
                  <Group justify="flex-end" mt="md">
                    <Button
                      variant="subtle"
                      onClick={() => setIsGenerating(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => {
                        setGeneratedContent('');
                        handleGeneratePost();
                      }}
                      leftSection={<IconWand size={16} />}
                    >
                      Generate Again
                    </Button>
                    <Button
                      onClick={() => {
                        if (editor) {
                          // Create a temporary div to parse HTML
                          const div = document.createElement('div');
                          div.innerHTML = generatedContent;

                          // Process images to ensure they're properly loaded
                          const images = div.getElementsByTagName('img');
                          Array.from(images).forEach((img) => {
                            if (img instanceof HTMLImageElement && img.src) {
                              img.setAttribute('data-src', img.src);
                            }
                          });

                          // Set content with processed HTML
                          editor.commands.setContent(div.innerHTML);

                          // Load images after content is set
                          editor.view.dom
                            .querySelectorAll('img[data-src]')
                            .forEach((img) => {
                              if (img instanceof HTMLImageElement) {
                                const src = img.getAttribute('data-src');
                                if (src) {
                                  img.src = src;
                                  img.removeAttribute('data-src');
                                }
                              }
                            });
                        }
                        notifications.show({
                          title: 'Success',
                          message: 'Post content applied successfully',
                          color: 'green',
                        });
                        setIsGenerating(false);
                      }}
                      color="green"
                    >
                      Use This Content
                    </Button>
                  </Group>
                </Box>
              ) : isError ? (
                <Stack align="center" gap="md">
                  <Text size="lg" ta="center" c="red">
                    Failed to generate post content
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => handleGeneratePost()}
                    leftSection={<IconWand size={16} />}
                  >
                    Try Again
                  </Button>
                </Stack>
              ) : (
                <Stack align="center" gap="md">
                  <Text size="lg" ta="center">
                    AI is crafting your post...
                  </Text>
                  <Box style={{ width: '100%', maxWidth: 400 }}>
                    <div className="loading-animation" />
                  </Box>
                </Stack>
              )}
            </Stack>
          </Modal>

          {/* Post Success Modal */}
          <Modal
            opened={postResult !== null}
            onClose={() => setPostResult(null)}
            title=""
            size="md"
            centered
            padding="xl"
          >
            <Stack gap="lg" align="center">
              {postResult?.success ? (
                <>
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    color="green"
                    variant="light"
                  >
                    <IconCheck size={30} />
                  </ThemeIcon>

                  <Stack gap="xs" align="center">
                    <Title order={3} ta="center" c="green">
                      Post {form.values.isScheduled ? 'Scheduled' : 'Published'}{' '}
                      Successfully!
                    </Title>
                    <Text size="sm" ta="center" c="dimmed">
                      Your Facebook post has been{' '}
                      {form.values.isScheduled ? 'scheduled' : 'published'}{' '}
                      successfully
                    </Text>
                  </Stack>

                  {postResult.link && postResult.link !== '#' && (
                    <Paper withBorder p="md" w="100%" radius="md">
                      <Stack gap="xs">
                        <Group justify="space-between" align="center">
                          <Text size="sm" fw={500} c="dimmed">
                            Post Link
                          </Text>
                          <CopyButton value={postResult.link}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                                <ActionIcon
                                  variant="subtle"
                                  onClick={copy}
                                  color={copied ? 'green' : 'gray'}
                                >
                                  <IconCopy size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                        <Button
                          component="a"
                          href={postResult.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          color="blue"
                          fullWidth
                          leftSection={<IconBrandFacebook size={18} />}
                          rightSection={<IconExternalLink size={16} />}
                        >
                          View on Facebook
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                </>
              ) : (
                <>
                  <ThemeIcon size={60} radius="xl" color="red" variant="light">
                    <IconX size={30} />
                  </ThemeIcon>

                  <Stack gap="xs" align="center">
                    <Title order={3} ta="center" c="red">
                      Post Failed
                    </Title>
                    <Text size="sm" ta="center" c="dimmed">
                      There was an error publishing your post. Please try again.
                    </Text>
                  </Stack>
                </>
              )}

              <Divider w="100%" />

              <Group justify="center" w="100%">
                <Button
                  variant="filled"
                  onClick={() => setPostResult(null)}
                  size="md"
                  style={{ minWidth: 120 }}
                >
                  {postResult?.success ? 'Done' : 'Close'}
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Stack>
      </PageBody>
    </div>
  );
};

export default MarketingPage;
