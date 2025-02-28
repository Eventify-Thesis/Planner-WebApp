import React, { useState, useRef, useEffect } from 'react';
import { Button, message } from 'antd';
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
import { uploadFile } from '@/services/fileUpload.service';
import {
  eventInfoDraft,
  updateEventSetting,
  updateEventShow,
  updateEventPayment,
} from '@/services/event.service';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { BASE_COLORS } from '@/styles/themes/constants';
import dayjs from 'dayjs';

const { Step } = Steps;

const StyledFormContainer = styled.div`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? 'block' : 'none')};
`;

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ eventId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId } = params;
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({});
  const [formsValid, setFormsValid] = useState([false, false, false, false]);
  const formRefs = [useRef(), useRef(), useRef(), useRef()];
  const dispatch = useAppDispatch();

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
      // Redirect to step=info if not already present in the URL
      navigate('/create-event?step=info', { replace: true });
    }
  }, [searchParams]);

  const handleNext = async () => {
    let values;

    try {
      values = await formRefs[current].current.validateFields();
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.previous_step_required'),
      });
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
      notificationController.error({
        message: error.message || t('event_create.failed_to_save'),
      });
    }
  };

  const handlePrev = () => setCurrent(current - 1);

  const handleSave = async () => {
    let values;

    try {
      values = await formRefs[current].current.validateFields();
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.previous_step_required'),
      });
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
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.failed_to_save'),
      });
      throw error;
    }
  };

  const handleSaveAsDraft = async (values: any) => {
    try {
      const event = await eventInfoDraft({
        ...values,
        id: eventId,
      });

      if (event) {
        // Update URL with new event ID
        const newEventId = event.id || event._id;
        navigate(`/create-event/${newEventId}?step=${steps[current].key}`, {
          replace: true,
        });
      }

      notificationController.success({
        message: t('event_create.event_info_saved_successfully'),
      });

      return event;
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.failed_to_save'),
      });
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

      show.ticketTypes.forEach((ticket, ticketIndex) => {
        if (!ticket.name || !ticket.price || !ticket.quantity) {
          throw new Error(t('event_create.ticket_info_required'));
        }

        if (ticket.price < 0) {
          throw new Error(t('event_create.ticket_price_positive'));
        }

        if (ticket.quantity < 1) {
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

  const handleShowUpdate = async (updatedShow: any[]) => {
    try {
      // Validate shows before updating
      validateShows(updatedShow);

      await updateEventShow(eventId, {
        showings: updatedShow,
      });

      notificationController.success({
        message: t('event_create.event_info_saved_successfully'),
      });
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.failed_to_save_event_show'),
      });
      throw error;
    }
  };

  const handleSettingUpdate = async (updatedSetting: any) => {
    try {
      await updateEventSetting(eventId, updatedSetting);

      notificationController.success({
        message: t('event_create.event_info_saved_successfully'),
      });
    } catch (error) {
      notificationController.error({
        message:
          error.message || t('event_create.failed_to_save_event_setting'),
      });
      throw error;
    }
  };

  const handlePaymentUpdate = async (updatedPayment: any) => {
    try {
      await updateEventPayment(eventId, updatedPayment);

      notificationController.success({
        message: t('event_create.event_info_saved_successfully'),
      });
    } catch (error) {
      notificationController.error({
        message:
          error.message || t('event_create.failed_to_save_event_payment'),
      });
      throw error;
    }
  };

  const handleStepChange = async (nextStep: number) => {
    try {
      if (nextStep > current) {
        await formRefs[current].current.validateFields();
        return;
      }

      if (steps[current].content === EventInfoForm) {
        const values = formRefs[current].current.getFieldsValue();
        await handleSaveAsDraft(values);
      }

      if (eventId) {
        navigate(`/create-event/${eventId}?step=${steps[nextStep].key}`, {
          replace: true,
        });
      }

      setCurrent(nextStep);
    } catch (error) {
      notificationController.error({
        message:
          nextStep > current
            ? t('event_create.previous_step_required')
            : t('event_create.next_step_required'),
      });
    }
  };

  return (
    <StyledFormContainer>
      <PageTitle>Eventify Planner</PageTitle>
      <StickyHeader>
        <HeaderContent>
          <Steps
            current={current}
            onChange={handleStepChange}
            style={{
              flex: 1,
              maxWidth: '1200px',
            }}
          >
            {steps.map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>
          <NavigationControls>
            <Button style={{ marginRight: 1 }} onClick={handleSave}>
              {t('event_create.save')}
            </Button>

            {current < steps.length - 1 && (
              <Button
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--text-main-color)',
                  borderColor: 'var(--primary-color)',
                }}
                type="primary"
                onClick={handleNext}
              >
                {t('event_create.continue')}
              </Button>
            )}
          </NavigationControls>
        </HeaderContent>
      </StickyHeader>

      <div style={{ paddingTop: 24 }}>
        {steps.map((step, index) => (
          <FormContainer key={index} $active={current === index}>
            <step.content
              formRef={formRefs[index]}
              onValidate={current === index ? handleNext : undefined}
            />
          </FormContainer>
        ))}
      </div>
    </StyledFormContainer>
  );
};

export default EventCreatePage;
