import './index.css';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{
      algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      cssVar: true,
      components: {
        Layout: {
          headerColor: "rgb(255,255,255, 0.88)"
        }
      }
    }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
