import nightModeReducer from '@/store/slices/nightModeSlice';
import themeReducer from '@/store/slices/themeSlice';
import pwaReducer from '@/store/slices/pwaSlice';
import queryReducer from '@/store/slices/querySlice';

export default {
  query: queryReducer,
  nightMode: nightModeReducer,
  theme: themeReducer,
  pwa: pwaReducer,
};
