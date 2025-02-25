import { StrictMode } from 'react';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { createRoot } from 'react-dom/client';
import './i18n';
import 'typeface-open-sans';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
