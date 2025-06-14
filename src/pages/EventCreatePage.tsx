import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShowAndTicketForm } from '@/components/event-create/ShowAndTicket/ShowAndTicketForm';
import { EventSettingsForm } from '@/components/event-create/EventSettings/EventSettingsForm';
import { PaymentInfoForm } from '@/components/event-create/PaymentInfo/PaymentInfoForm';
import EventInfoForm from '@/components/event-create/EventInfo/EventInfoForm';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEventMutations } from '@/queries/useEventQueries';

// Mantine imports
import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  rem,
  Stepper,
  useMantineTheme,
  Flex,
} from '@mantine/core';
import './eventCreatePage.css';
import './mantine.styles.css';
import { IconCheck, IconArrowUp } from '@tabler/icons-react';
import { safeValidateForm } from '@/utils/formUtils';
import { showError, showSuccess } from '@/utils/notifications';

// FormContainer component that shows or hides based on active state with a nice transition effect
interface FormContainerProps {
  active: boolean;
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ active, children }) => {
  return active ? <div style={{ padding: '1rem' }}>{children}</div> : null;
};

const EventCreatePage: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const params = useParams<{ eventId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId } = params;
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const formRefs = [useRef(), useRef(), useRef(), useRef()];

  const { infoDraftMutation, showMutation, settingMutation, paymentMutation } =
    useEventMutations(eventId);

  const steps = [
    { title: 'Event Info', key: 'info', content: EventInfoForm },
    { title: 'Show & Tickets', key: 'show', content: ShowAndTicketForm },
    { title: 'Event Settings', key: 'setting', content: EventSettingsForm },
    { title: 'Payment Info', key: 'payment', content: PaymentInfoForm },
  ];

  useEffect(() => {
    const step = searchParams.get('step');

    if (step) {
      const stepIndex = steps.findIndex((s) => s.key == step);
      if (stepIndex !== -1) {
        setCurrent(stepIndex);
      }
    }

    if (!step) {
      navigate('/create-event?step=info', { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    // Set initial scroll position
    setShowScrollTop(window.scrollY > 200);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const validateShows = (shows: any[]) => {
    if (!shows || shows.length === 0) {
      throw new Error(t('event_create.at_least_one_show'));
    }

    shows.forEach((show, index) => {
      if (!show.startTime || !show.endTime) {
        throw new Error(t('event_create.show_time_required'));
      }

      if (dayjs(show.startTime).isAfter(dayjs(show.endTime))) {
        throw new Error(t('event_create.start_time_before_end_time'));
      }

      if (!show.ticketTypes || show.ticketTypes.length === 0) {
        throw new Error(t('event_create.at_least_one_ticket_type'));
      }

      show.ticketTypes.forEach((ticketType) => {
        if (ticketType.id < 0) {
          delete ticketType.id;
        }

        if (!ticketType.price) {
          ticketType.price = 0;
        }

        if (!ticketType.name || !ticketType.quantity) {
          throw new Error(t('event_create.ticket_info_required'));
        }

        if (ticketType.price < 0) {
          throw new Error(t('event_create.ticket_price_positive'));
        }

        if (ticketType.quantity < 1) {
          throw new Error(t('event_create.ticket_quantity_positive'));
        }
      });

      // Check for overlapping shows
      shows.forEach((otherShow, otherIndex) => {
        if (index !== otherIndex) {
          const showStart = dayjs(show.startTime);
          const showEnd = dayjs(show.endTime);
          const otherStart = dayjs(otherShow.startTime);
          const otherEnd = dayjs(otherShow.endTime);

          if (
            showStart.isBetween(otherStart, otherEnd, null, '[]') ||
            showEnd.isBetween(otherStart, otherEnd, null, '[]') ||
            otherStart.isBetween(showStart, showEnd, null, '[]') ||
            otherEnd.isBetween(showStart, showEnd, null, '[]')
          ) {
            throw new Error(t('event_create.overlapping_shows'));
          }
        }
      });
    });
  };

  const handleNext = async () => {
    let values;

    try {
      values = await safeValidateForm(formRefs[current]);
    } catch (error) {
      showError(error.message || t('event_create.previous_step_required'));
      throw error;
    }

    try {
      if (steps[current].content === EventInfoForm) {
        const event = await handleSaveAsDraft(values);

        if (event && !eventId) {
          const newEventId = event.id || event._id;
          navigate(
            `/create-event/${newEventId}?step=${steps[current + 1].key}`,
            {
              replace: true,
            },
          );
        }
      }

      if (steps[current].content === ShowAndTicketForm) {
        await handleSave();
      }

      if (steps[current].content === EventSettingsForm) {
        await handleSave();
      }

      if (steps[current].content === PaymentInfoForm) {
        await handleSave();
      }

      if (eventId) {
        navigate(`/create-event/${eventId}?step=${steps[current + 1].key}`, {
          replace: true,
        });
      }

      setCurrent(current + 1);
    } catch (error) {
      showError(error.message || t('event_create.failed_to_save'));
    }
  };

  const handleSave = async () => {
    let values;

    try {
      values = await safeValidateForm(formRefs[current]);
    } catch (error) {
      showError(error.message || t('event_create.previous_step_required'));
      throw error;
    }

    try {
      if (steps[current].content === EventInfoForm) {
        await handleSaveAsDraft(values);
      }

      if (steps[current].content === ShowAndTicketForm) {
        await handleShowUpdate(values.shows);
      }

      if (steps[current].content === EventSettingsForm) {
        await handleSettingUpdate(values);
      }

      if (steps[current].content === PaymentInfoForm) {
        await handlePaymentUpdate(values);
      }

      showSuccess(t('event_create.event_info_saved_successfully'));
    } catch (error) {
      showError(error.message || t('event_create.failed_to_save'));
      throw error;
    }
  };

  const handleSaveAsDraft = async (values: any) => {
    try {
      console.log(values);
      const event = await infoDraftMutation.mutateAsync(values);

      if (event) {
        const newEventId = event.id || event._id;
        navigate(`/create-event/${newEventId}?step=${steps[current].key}`, {
          replace: true,
        });
      }

      return event;
    } catch (error) {
      throw error;
    }
  };

  const handleShowUpdate = async (updatedShow: any[]) => {
    try {
      validateShows(updatedShow);
      await showMutation.mutateAsync({ shows: updatedShow });
    } catch (error) {
      throw error;
    }
  };

  const handleSettingUpdate = async (updatedSetting: any) => {
    try {
      await settingMutation.mutateAsync(updatedSetting);
    } catch (error) {
      throw error;
    }
  };

  const handlePaymentUpdate = async (updatedPayment: any) => {
    try {
      await paymentMutation.mutateAsync(updatedPayment);

      navigate(`/events/${eventId}/dashboard`, {
        replace: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleStepChange = async (nextStep: number) => {
    try {
      if (nextStep > current) {
        await safeValidateForm(formRefs[current]);
        return;
      }

      // Reset not needed as we're navigating back
      if (eventId) {
        navigate(`/create-event/${eventId}?step=${steps[nextStep].key}`, {
          replace: true,
        });
      }

      setCurrent(nextStep);
    } catch (error) {
      showError(
        error.message ||
          (nextStep > current
            ? t('event_create.previous_step_required')
            : t('event_create.next_step_required')),
      );
    }
  };

  const theme = useMantineTheme();

  return (
    <div ref={pageTopRef} style={{ width: '100%' }}>
      {/* Scroll to top button */}
      <div
        style={{
          position: 'fixed',
          bottom: rem(24),
          right: rem(24),
          zIndex: 9999,
          transition: 'all 0.3s ease',
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showScrollTop ? 'all' : 'none',
        }}
      >
        <Button
          color={theme.primaryColor}
          radius="xl"
          size="md"
          onClick={scrollToTop}
          variant="filled"
          leftSection={<IconArrowUp size={16} />}
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {t('event_create.top')}
        </Button>
      </div>

      <Container
        size="100%"
        style={{ padding: '0', position: 'relative', maxWidth: '100%' }}
      >
        <Paper
          shadow="md"
          radius="lg"
          withBorder
          mx="auto"
          my="md"
          style={{
            borderColor: theme.colors.gray[3],
            background: `linear-gradient(to right bottom, ${theme.white}, ${
              theme.colors[theme.primaryColor][0]
            })`,
            position: 'relative',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              minHeight: rem(80),
              zIndex: 100,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: `${theme.radius.lg} ${theme.radius.lg} 0 0`,
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
              borderBottom: `1px solid ${theme.colors.gray[2]}`,
              width: '100%',
              margin: 0,
            }}
          >
            <Group
              align="flex-start"
              justify="space-between"
              wrap="nowrap"
              style={{ margin: '0' }}
            >
              {/* Stepper */}
              <Box
                style={{
                  flexGrow: 1,
                  paddingRight: rem(24),
                  paddingBottom: rem(10),
                }}
              >
                <Stepper
                  active={current}
                  onStepClick={handleStepChange}
                  size="md"
                  allowNextStepsSelect={false}
                  styles={(theme) => ({
                    root: {
                      padding: 'px 0',
                      backgroundColor: 'transparent',
                      width: '100%',
                    },
                    stepBody: {
                      alignItems: 'center',
                      display: 'flex',
                      flex: 1,
                    },
                    stepLabel: {
                      fontSize: theme.fontSizes.sm,
                      fontWeight: 600,
                      marginTop: 6,
                      color: theme.colors.gray[7],
                    },
                    step: {
                      flex: 1,
                    },
                    stepIcon: {
                      borderWidth: 2,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      fontSize: theme.fontSizes.sm,
                      '&[data-completed]': {
                        backgroundColor: theme.colors.blue[6],
                        borderColor: theme.colors.blue[6],
                        color: theme.white,
                      },
                    },
                    separator: {
                      flex: 1,
                      height: 2,
                      margin: 0,
                      minWidth: '20px',
                      maxWidth: 'none',
                    },
                  })}
                  classNames={{ root: 'stepper-root', stepBody: 'step-body' }}
                >
                  {steps.map((step, index) => (
                    <Stepper.Step
                      key={index}
                      label={step.title}
                      completedIcon={<IconCheck size={18} />}
                    />
                  ))}
                </Stepper>
              </Box>

              {/* Buttons - Fixed width on the right */}
              <Flex direction="row" gap="xs" wrap="nowrap" align="center">
                <Button
                  variant="subtle"
                  onClick={handleSave}
                  leftSection={<IconCheck size={16} />}
                  style={{ fontWeight: 500 }}
                >
                  {t('event_create.save')}
                </Button>

                {current > 0 && (
                  <Button
                    variant="outline"
                    color={theme.primaryColor}
                    style={{
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleStepChange(current - 1)}
                  >
                    {t('event_create.back')}
                  </Button>
                )}
                {current < steps.length - 1 && (
                  <Button
                    color={theme.primaryColor}
                    onClick={handleNext}
                    style={{
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {t('event_create.continue')}
                  </Button>
                )}
              </Flex>
            </Group>
          </Box>

          {steps.map((step, index) => (
            <FormContainer key={index} active={current === index}>
              <step.content
                formRef={formRefs[index]}
                onValidate={current === index ? handleNext : undefined}
              />
            </FormContainer>
          ))}
        </Paper>
      </Container>
    </div>
  );
};

export default EventCreatePage;
