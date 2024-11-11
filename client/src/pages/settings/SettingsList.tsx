import { PieChartOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SettingsList: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const selectedKeys = [location.pathname.split('/')[2]];

  return (
    <>
      <Menu mode='inline' className='h-full' selectedKeys={selectedKeys} items={[
        {
          key: 'settings',
          label: <div className='text-xl m-3'>Settings</div>,
          type: 'group',
          children: [
            {
              key: 'account',
              label: 'My Account',
              icon: <UserOutlined />,
              onClick: () => { navigate('/settings/account') }
            }, {
              key: 'budget',
              label: 'Budget',
              icon: <PieChartOutlined />,
              onClick: () => { navigate('/settings/budget') }
            }
          ]
        }
      ]} />
    </>
  );
};

export default SettingsList;