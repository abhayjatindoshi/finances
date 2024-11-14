import './index.css';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import database from './db/database';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ConfigProvider theme={{
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    cssVar: true,
    token: {
      fontSize: 20,
    },
    components: {
      Layout: {
        headerColor: "rgb(255,255,255, 0.88)"
      },
      Segmented: {
        trackBg: '#3d3d3d',
      }
    }
  }}>
    <DatabaseProvider database={database}>
      <RouterProvider router={router} />
    </DatabaseProvider>
  </ConfigProvider>
);
