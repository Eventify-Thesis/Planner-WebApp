import { configureStore } from '@reduxjs/toolkit';
import { errorLoggingMiddleware } from '@/store/middlewares/errorLogging.middleware';
import rootReducer from '@/store/slices';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorLoggingMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
