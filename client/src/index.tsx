import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import { ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { antTheme } from './constants';
import './i18n';
import './index.css';
import router from './router';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <FluentProvider theme={webDarkTheme}>
    <ConfigProvider theme={antTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </FluentProvider>
);
