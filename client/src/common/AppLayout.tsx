import { Layout } from 'antd';
import Toolbar from '../toolbar/Toolbar';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { createGlobalVariable } from '../utils/GlobalVariable';
import SyncProgress from './SyncProgress';

function AppLayout() {

  const { Header, Content } = Layout;
  const isScreenLandscape = createGlobalVariable<boolean>('isScreenLandscape');

  useEffect(() => {

    const resizeHelper = () => {
      const { innerWidth, innerHeight } = window;
      isScreenLandscape.next(innerWidth > innerHeight);
    }
    window.addEventListener('resize', resizeHelper);
    resizeHelper();

    return () => window.removeEventListener('resize', resizeHelper);

  }, [isScreenLandscape]);

  return (
    <Layout className='min-h-screen'>
      <Content className='overflow-auto app-content-height'>
        <SyncProgress />
        <Outlet />
      </Content>
      <Header>
        <Toolbar />
      </Header>
    </Layout>
  );
}

export default AppLayout;