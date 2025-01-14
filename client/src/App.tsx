import { Layout } from 'antd';
import Toolbar from './toolbar/Toolbar';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createGlobalVariable, subscribeTo } from './utils/GlobalVariable';
import AppLoaderPage from './pages/AppLoaderPage';
import LinearProgress from '@mui/material/LinearProgress';
import { unsubscribeAll } from './utils/ComponentUtils';


const { Header, Content } = Layout;

function App() {

  const isScreenLandscape = createGlobalVariable<boolean>('isScreenLandscape');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    const resizeHelper = () => {
      const { innerWidth, innerHeight } = window;
      isScreenLandscape.next(innerWidth > innerHeight);
    }
    window.addEventListener('resize', resizeHelper);
    resizeHelper();

    const syncSubscription = subscribeTo('syncing', b => setSyncing(b as boolean));
    return unsubscribeAll(syncSubscription);

  }, [isScreenLandscape, loading]);

  return (
    loading ?
      <AppLoaderPage onLoadingComplete={() => setLoading(false)} /> :
      <Layout className='min-h-screen'>
        <Content className='overflow-auto app-content-height'>
          {syncing && <LinearProgress className="rounded w-full top-0 left-0 right-0" />}
          <Outlet />
        </Content>
        <Header>
          <Toolbar />
        </Header>
      </Layout>
  );
}

export default App;