import userReducer from '@/store/slices/userSlice';
import authReducer from '@/store/slices/authSlice';
import nightModeReducer from '@/store/slices/nightModeSlice';
import themeReducer from '@/store/slices/themeSlice';
import pwaReducer from '@/store/slices/pwaSlice';
import queryReducer from '@/store/slices/querySlice';

export default {
  user: userReducer,
  auth: authReducer,
  query: queryReducer,
  nightMode: nightModeReducer,
  theme: themeReducer,
  pwa: pwaReducer,
};
