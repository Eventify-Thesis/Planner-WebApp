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
import { eventInfoDraft } from '@/services/eventInfoDraft.service';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/reduxHooks';

const { Step } = Steps;

const StyledFormContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? 'block' : 'none')};
`;

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ eventId?: string; step?: string }>();
  const { eventId, step } = params;
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({});
  const [formsValid, setFormsValid] = useState([false, false, false, false]);
  const formRefs = [useRef(), useRef(), useRef(), useRef()];
  const dispatch = useAppDispatch();

  const steps = [
    { title: 'Event Info', content: EventInfoForm },
    { title: 'Show & Tickets', content: ShowAndTicketForm },
    { title: 'Event Settings', content: EventSettingsForm },
    { title: 'Payment Info', content: PaymentInfoForm },
  ];

  useEffect(() => {
    if (step) {
      setCurrent(Number(step));
    }
  }, [step]);

  const handleNext = async () => {
    try {
      // Validate current step
      const values = await formRefs[current].current.validateFields();

      // If it's the first step (EventInfoForm), save the event draft
      if (steps[current].content === EventInfoForm) {
        const event = await handleSaveAsDraft(values);

        // Update URL with new event ID if it's a new event
        if (event && !eventId) {
          const newEventId = event.id || event._id;
          navigate(`/create-event/${newEventId}/${current + 1}`, {
            replace: true,
          });
        }
      }

      // Update URL to include eventId when navigating
      if (eventId) {
        navigate(`/create-event/${eventId}/${current + 1}`, { replace: true });
      }

      setCurrent(current + 1);
    } catch (error) {
      notificationController.error({
        message:
          error.message || 'Please fill all required fields before continuing',
      });
    }
  };

  const handlePrev = () => setCurrent(current - 1);

  const handleSave = async () => {
    try {
      const values = await formRefs[current].current.validateFields();

      if (steps[current].content === EventInfoForm) {
        handleSaveAsDraft(values);
      }
    } catch (error) {
      notificationController.error({
        message: 'Please fill all required fields before continuing',
      });
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
        navigate(`/create-event/${newEventId}/${current}`, { replace: true });
      }
      return event;
    } catch (error) {
      notificationController.error({
        message: error.message || t('event_create.failed_to_save'),
      });
      throw error;
    }
  };

  const handleStepChange = async (nextStep: number) => {
    try {
      // Only validate when moving forward
      if (nextStep > current) {
        await formRefs[current].current.validateFields();
      }

      // Save draft if it's the EventInfoForm
      if (steps[current].content === EventInfoForm) {
        const values = formRefs[current].current.getFieldsValue();
        await handleSaveAsDraft(values);
      }

      // Update URL to include eventId when navigating
      if (eventId) {
        navigate(`/create-event/${eventId}/${nextStep}`, { replace: true });
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
              maxWidth: '1300px',
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
                  color: 'white',
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
