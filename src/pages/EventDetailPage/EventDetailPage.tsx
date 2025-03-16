import React from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { EventDetailLayout } from '../../components/layouts/event/EventDetailLayout/EventDetailLayout';
import { Spin } from 'antd';
import { EventProvider } from '../../contexts/EventContext';
import { useGetEventBrief } from '@/queries/useGetEventBrief';
import { useEffect } from 'react';
import { ErrorResult } from '@/components/common/ErrorResult';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: eventBrief, isLoading, error } = useGetEventBrief(eventId);

  useEffect(() => {
    // Redirect to analytics by default if no specific route is selected
    if (location.pathname === `/event/${eventId}`) {
      navigate(`/event/${eventId}/analytics`);
    }
  }, [eventId, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorResult error={error} />;
  }

  if (!eventBrief) {
    return <div>Event not found</div>;
  }

  return (
    <EventProvider value={{ eventBrief }}>
      <EventDetailLayout eventName={eventBrief.eventName}>
        <Outlet />
      </EventDetailLayout>
    </EventProvider>
  );
};
