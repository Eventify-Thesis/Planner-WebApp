import React from 'react';
import { RouteObject } from 'react-router-dom';
import { EventDetailPage } from '../pages/EventDetailPage/EventDetailPage';
import EventEditPage from '@/pages/EventEditPage';

// Lazy load components for better performance
const EventDashboard = React.lazy(
  () => import('@/components/event/EventDashboard/EventDashboard'),
);
const EventOrders = React.lazy(
  () => import('@/components/event/EventOrders/EventOrders'),
);

const EventAttendees = React.lazy(
  () => import('@/components/event/EventAttendees/EventAttendees'),
);

const EventCheckin = React.lazy(
  () => import('@/components/event/EventCheckInLists/EventCheckInLists'),
);
const EventMembers = React.lazy(
  () => import('@/components/event/EventMembers/EventMembers'),
);

const EventSeatMap = React.lazy(
  () => import('@/components/event/EventSeatMap/EventSeatMap'),
);
const EventSeatingPlans = React.lazy(
  () => import('@/components/event/EventSeatingPlans/EventSeatingPlans'),
);
const EventQuestions = React.lazy(
  () => import('@/components/event/EventQuestions/EventQuestions'),
);
const EventVouchers = React.lazy(
  () => import('@/components/event/EventVouchers/EventVouchers'),
);
const EventSeatCategoryMapping = React.lazy(
  () =>
    import(
      '@/components/event/EventSeatCategoryMapping/EventSeatCategoryMapping'
    ),
);
const EventMarketing = React.lazy(
  () => import('@/pages/EventDetailPage/MarketingPage/MarketingPage'),
);

const LoadingFallback = () => <div>Loading...</div>;

export const eventDetailRoutes: RouteObject[] = [
  {
    path: '/events/:eventId',
    element: <EventDetailPage />,
    children: [
      {
        path: 'marketing',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventMarketing />
          </React.Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventDashboard />
          </React.Suspense>
        ),
      },
      {
        path: '',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventDashboard />
          </React.Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventOrders />
          </React.Suspense>
        ),
      },
      {
        path: 'attendees',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventAttendees />
          </React.Suspense>
        ),
      },
      {
        path: 'checkin',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventCheckin />
          </React.Suspense>
        ),
      },
      {
        path: 'members',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventMembers />
          </React.Suspense>
        ),
      },
      {
        path: 'edit-event/',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventEditPage />
          </React.Suspense>
        ),
      },
      {
        path: 'seating-plans',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventSeatingPlans />
          </React.Suspense>
        ),
      },
      {
        path: 'seatmap/:planId',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventSeatMap />
          </React.Suspense>
        ),
      },
      {
        path: 'seat-category-mapping',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventSeatCategoryMapping />
          </React.Suspense>
        ),
      },
      {
        path: 'questions',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventQuestions />
          </React.Suspense>
        ),
      },
      {
        path: 'vouchers',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventVouchers />
          </React.Suspense>
        ),
      },
    ],
  },
];
