import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './i18n';
import './index.css';
import router from './router';

// Create custom dark theme with black background
const customDarkTheme = {
  ...webDarkTheme,
  colorNeutralBackground1: '#000000',
  colorNeutralBackground2: '#121212',
  // Set dropdown backgrounds to match dialog theme
  colorNeutralBackground3: '#121212',
  colorNeutralBackground4: '#1a1a1a',
  colorNeutralBackground5: '#1a1a1a',
  colorNeutralBackground6: '#1a1a1a',
};



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <FluentProvider theme={customDarkTheme}>
      <RouterProvider router={router} />
  </FluentProvider>
);
