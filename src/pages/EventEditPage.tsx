import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import styled from 'styled-components';
import { ShowAndTicketForm } from '@/components/event-create/ShowAndTicket/ShowAndTicketForm';
import { EventSettingsForm } from '@/components/event-create/EventSettings/EventSettingsForm';
import { PaymentInfoForm } from '@/components/event-create/PaymentInfo/PaymentInfoForm';
import {
  HeaderContent,
  NavigationControls,
  StickyHeader,
} from '@/components/event-create/styles';
import EventInfoForm from '@/components/event-create/EventInfo/EventInfoForm';
import { Steps } from '@/components/common/BaseSteps/BaseSteps.styles';
import { notificationController } from '@/controllers/notificationController';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEventMutations } from '@/queries/useEventQueries';
import { showError, showSuccess } from '@/utils/notifications';
import { safeValidateForm } from '@/utils/formUtils';
import {
  Box,
  Container,
  Flex,
  Group,
  Paper,
  rem,
  Stepper,
  useMantineTheme,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
const { Step } = Steps;

// FormContainer component that shows or hides based on active state with a nice transition effect
interface FormContainerProps {
  active: boolean;
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ active, children }) => {
  return active ? <div style={{ padding: '1rem' }}>{children}</div> : null;
};

const EventEditPage: React.FC = () => {
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
      setSearchParams({ step: 'info' });
    }
  }, [searchParams]);

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
          navigate(`?step=${steps[current + 1].key}`, {
            replace: true,
          });
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
        navigate(`?step=${steps[current + 1].key}`, {
          replace: true,
        });
      }

      setCurrent(current + 1);
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.failed_to_save'),
      });
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
      const event = await infoDraftMutation.mutateAsync({
        ...values,
        id: eventId,
      });

      showSuccess(t('event_create.event_info_saved_successfully'));

      if (event) {
        navigate(`?step=${steps[current].key}`, {
          replace: true,
        });
      }

      return event;
    } catch (error) {
      throw error;
    }
  };

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
        if (!ticketType.name || !ticketType.price || !ticketType.quantity) {
          throw new Error(t('event_create.ticket_info_required'));
        }

        if (ticketType.price < 0) {
          throw new Error(t('event_create.ticket_price_positive'));
        }

        if (ticketType.quantity < 1) {
          throw new Error(t('event_create.ticket_quantity_positive'));
        }
      });

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

  const handleShowUpdate = async (updatedShow: any[]) => {
    try {
      validateShows(updatedShow);
      await showMutation.mutateAsync({
        eventId,
        shows: updatedShow,
      });
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
    } catch (error) {
      throw error;
    }
  };

  const handleStepChange = async (nextStep: number) => {
    try {
      formRefs[current].current?.reset();

      if (eventId) {
        navigate(`?step=${steps[nextStep].key}`, {
          replace: true,
        });
      }

      setCurrent(nextStep);
    } catch (error) {
      console.log(error);
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
    <Container size="100%" style={{ overflow: 'hidden', padding: '0' }}>
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
        }}
      >
        <Box
          pos="sticky"
          top={0}
          py="sm"
          px="md"
          style={{
            zIndex: 10,
            borderRadius: theme.radius.md,
            backgroundColor: theme.white,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.colors.gray[2]}`,
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
                    fontSize: theme.fontSizes.sm,
                    // '&[data-completed]': {
                    //   backgroundColor: theme.colors.blue[6],
                    //   borderColor: theme.colors.blue[6],
                    //   color: theme.white,
                    // },
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
  );
};

export default EventEditPage;
