import './i18n';
import './index.css';
import { antTheme } from './constants';
import { ConfigProvider } from 'antd';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { RouterProvider } from 'react-router-dom';
import database from './db/database';
import ReactDOM from 'react-dom/client';
import router from './router';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ConfigProvider theme={antTheme}>
    <DatabaseProvider database={database}>
      <RouterProvider router={router} />
    </DatabaseProvider>
  </ConfigProvider>
);
