import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// // no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(
  () => import('@/components/layouts/AuthLayout/AuthLayout'),
);
// import LoginPage from "@/pages/LoginPage";
// import SignUpPage from "@/pages/SignUpPage";
// import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
// import SecurityCodePage from "@/pages/SecurityCodePage";
// import NewPasswordPage from "@/pages/NewPasswordPage";
// import LockPage from "@/pages/LockPage";

import MainLayout from '@/components/layouts/main/MainLayout/MainLayout';

// import ProfileLayout from "@/components/profile/ProfileLayout";
import RequireAuth from '@/components/router/RequireAuth';
const EventDetailPage = React.lazy(() => import('@/pages/EventDetailPage'));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));

import { withLoading } from '@/hocs/withLoading.hoc';
import { SignIn, SignUp } from '@clerk/clerk-react';
import HomePage from '@/pages/HomePage';
// import NftDashboardPage from "@/pages/DashboardPages/HomePage";
// import MedicalDashboardPage from "@/pages/DashboardPages/DashboardPage";

// const NewsFeedPage = React.lazy(() => import("@/pages/NewsFeedPage"));
// const ServerErrorPage = React.lazy(() => import("@/pages/ServerErrorPage"));
// const Error404Page = React.lazy(() => import("@/pages/Error404Page"));
// const SecuritySettingsPage = React.lazy(
//   () => import("@/pages/SecuritySettingsPage")
// );
// const UploadCVPage = React.lazy(() => import("@/pages/UploadCVPage"));
// const Logout = React.lazy(() => import("./Logout"));
// const LandingPage = React.lazy(
//   () => import("@/components/landing/LandingMain/LandingMain")
// );
// const JobsFeedPage = React.lazy(
//   () => import("@/components/apps/jobsFeed/JobsFeed")
// );
// const HistoryJobsFeedPage = React.lazy(
//   () => import("@/components/historyJobsFeed/HistoryJobsFeed")
// );
// const PersonalInfoPage = React.lazy(
//   () => import("@/pages/PersonalInfoPage")
// );

// export const NFT_DASHBOARD_PATH = "/";
// export const MEDICAL_DASHBOARD_PATH = "/medical-dashboard";

// // const NewsFeed = withLoading(NewsFeedPage);
// const Landing = withLoading(LandingPage);
// const JobsFeed = withLoading(JobsFeedPage);
// const HistoryJobsFeed = withLoading(HistoryJobsFeedPage);
// const PersonalInfo = withLoading(PersonalInfoPage);

// const ServerError = withLoading(ServerErrorPage);
// const Error404 = withLoading(Error404Page);

// // Profile
// const SecuritySettings = withLoading(SecuritySettingsPage);
// const UploadCV = withLoading(UploadCVPage);

const AuthLayoutFallback = withLoading(AuthLayout);
// const LogoutFallback = withLoading(Logout);
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
        <Route path={HOME_PATH} element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        <Route path={HOME_PATH} element={protectedLayout}>
          <Route path="event-detail" element={<EventDetailPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="homepage" element={<HomePage />} />
        </Route>

        <Route path="/auth" element={<AuthLayoutFallback />}>
          <Route path="login" element={<SignIn signUpUrl="/auth/sign-up" />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
