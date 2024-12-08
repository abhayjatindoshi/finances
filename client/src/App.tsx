import { Layout } from 'antd';
import Toolbar from './toolbar/Toolbar';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createGlobalVariable } from './utils/GlobalVariable';
import AppLoaderPage from './pages/AppLoaderPage';
import { autoSync } from './utils/DbUtils';

const { Header, Content } = Layout;

function App() {

  const isScreenLandscape = createGlobalVariable<boolean>('isScreenLandscape');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const resizeHelper = () => {
      const { innerWidth, innerHeight } = window;
      isScreenLandscape.next(innerWidth > innerHeight);
    }
    window.addEventListener('resize', resizeHelper);
    resizeHelper();

    if (!loading) autoSync();
  }, [isScreenLandscape, loading]);

  return (
    loading ?
      <AppLoaderPage onLoadingComplete={() => setLoading(false)} /> :
      <Layout className='min-h-screen'>
        <Content className='overflow-auto app-content-height'>
          <Outlet />
        </Content>
        <Header>
          <Toolbar />
        </Header>
      </Layout>
  );
}

export default App;