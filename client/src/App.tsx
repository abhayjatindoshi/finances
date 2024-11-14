import { Layout } from 'antd';
import Toolbar from './toolbar/Toolbar';
import { Outlet } from 'react-router-dom';
import { sync } from './db/sync';
import { useEffect } from 'react';
import { createGlobalVariable } from './utils/GlobalVariable';

const { Header, Content } = Layout;

function App() {

  const isScreenLandscape = createGlobalVariable<boolean>('isScreenLandscape');

  useEffect(() => {
    setInterval(() => {
      sync();
    }, 6000);


    const resizeHelper = () => {
      const { innerWidth, innerHeight } = window;
      isScreenLandscape.next(innerWidth > innerHeight);
    }
    window.addEventListener('resize', resizeHelper);
    resizeHelper();
  }, [isScreenLandscape]);

  return (
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