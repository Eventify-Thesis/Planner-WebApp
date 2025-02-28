import React, { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { EventDetailLayout } from '../../components/layouts/event/EventDetailLayout/EventDetailLayout';
import { Spin } from 'antd';
import { EventBriefResponse } from '@/api/events.api';
import { getEventBrief } from '@/services/event.service';

interface EventDetails {
  id: string;
  name: string;
  // Add other event details as needed
}

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventBrief, setEventBrief] = useState<EventBriefResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to analytics by default if no specific route is selected
    if (location.pathname === `/event/${eventId}`) {
      navigate(`/event/${eventId}/analytics`);
    }
  }, [eventId, location.pathname, navigate]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await getEventBrief(eventId || '');

        setEventBrief(response);
      } catch (error) {
        console.error('Error fetching event details:', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  if (loading) {
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

  if (!eventBrief) {
    return <div>Event not found</div>;
  }

  return (
    <EventDetailLayout eventName={eventBrief.eventName}>
      <Outlet />
    </EventDetailLayout>
  );
};
