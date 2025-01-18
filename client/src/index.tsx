import './i18n';
import './index.css';
import { antTheme } from './constants';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import router from './router';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ConfigProvider theme={antTheme}>
    <RouterProvider router={router} />
  </ConfigProvider>
);
