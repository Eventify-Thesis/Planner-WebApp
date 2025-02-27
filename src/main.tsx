import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { createRoot } from 'react-dom/client';
import './i18n';
import { unstableSetRender } from 'antd';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
