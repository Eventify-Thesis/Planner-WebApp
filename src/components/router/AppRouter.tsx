import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// // no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(
  () => import('@/components/layouts/AuthLayout/AuthLayout'),
);

import MainLayout from '@/components/layouts/main/MainLayout/MainLayout';

import RequireAuth from '@/components/router/RequireAuth';

import { withLoading } from '@/hocs/withLoading.hoc';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { NotFound } from '../common/NotFound/NotFound';
const EventDashboardPage = React.lazy(
  () => import('@/pages/EventDashboardPage'),
);

const AuthLayoutFallback = withLoading(AuthLayout);
export const HOME_PATH = '/';

export const AppRouter: React.FC = () => {
  const protectedLayout = (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path={HOME_PATH} element={<Navigate to="/events" replace />} />

        <Route path={HOME_PATH} element={protectedLayout}>
          <Route path="events" element={<EventDashboardPage />} />
          <Route path="export-file" element={<NotFound />} />
          <Route path="legal-document" element={<NotFound />} />
        </Route>
        <Route path="/auth" element={<AuthLayoutFallback />}>
          <Route path="login" element={<SignIn signUpUrl="/auth/sign-up" />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
