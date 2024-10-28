import './App.css';
import { Layout } from 'antd';
import Toolbar from './layout/Toolbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout>
      <Header>
        <Toolbar />
      </Header>
      <Content>
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={DashboardPage} />
            <Route path="/accounts/:id" Component={AccountPage} />
          </Routes>
        </BrowserRouter>
      </Content>
      <Footer className="text-center text-sm">
        Finances&#174; 2024 | Created with 🤍 by <a href="https://encryptorcode.github.io/" rel='noopener noreferrer' target='_blank'>Abhay Jatin Doshi</a>
      </Footer>
    </Layout>
  );
}

export default App;
