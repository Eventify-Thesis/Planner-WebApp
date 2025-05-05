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

import { IconBrandFacebook, IconWand } from '@tabler/icons-react';
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
        return;
      }

      // Extract image URLs from the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.getHTML();
      const imageUrls = Array.from(tempDiv.getElementsByTagName('img'))
        .map((img) => (img instanceof HTMLImageElement ? img.src : null))
        .filter((url): url is string => url !== null);

      const variables: SchedulePostVariables = {
        eventId,
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

      await schedulePost.mutateAsync(variables);

      notifications.show({
        title: 'Success',
        message: 'Post scheduled successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to schedule post',
        color: 'red',
      });
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
              <Card withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="lg" fw={500}>
                      Generate Facebook Post
                    </Text>
                    <Button
                      leftSection={<IconWand size={16} />}
                      onClick={handleGeneratePost}
                      loading={generatePost.isPending}
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

              <Card withBorder mt="md">
                <Stack gap="md">
                  <Text size="lg" fw={500}>
                    Schedule Post
                  </Text>
                  {!facebookPages?.data?.result?.length ? (
                    <Button
                      leftSection={<IconBrandFacebook size={16} />}
                      onClick={() => {
                        window.location.href = `${
                          import.meta.env.VITE_API_BASE_URL
                        }/event/auth/facebook?state=${eventId}&userId=${
                          user.id
                        }`;
                      }}
                      variant="filled"
                      color="blue"
                    >
                      Connect with Facebook
                    </Button>
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
                        disabled={
                          !selectedPage ||
                          !editor?.getHTML() ||
                          (form.values.isScheduled &&
                            !form.values.scheduledTime)
                        }
                      >
                        {form.values.isScheduled ? 'Schedule Post' : 'Post Now'}
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
        </Stack>
      </PageBody>
    </div>
  );
};

export default MarketingPage;
