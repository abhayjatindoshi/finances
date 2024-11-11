import { Layout } from 'antd';
import Toolbar from './layout/Toolbar';
import { Outlet } from 'react-router-dom';
import { sync } from './db/sync';
import { useEffect } from 'react';

const { Header, Content } = Layout;

function App() {

  useEffect(() => {
    sync();
    setInterval(() => {
      sync();
    }, 60000);
  }, []);

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