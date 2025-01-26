import { BankOutlined, PieChartOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const SettingsList: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tenantId } = useParams();
  const selectedKeys = [location.pathname.split('/')[4]];

  return (
    <>
      <Menu mode='inline' className='h-full' selectedKeys={selectedKeys} items={[
        {
          key: 'settings',
          label: <div className='text-xl m-3'>{t('app.settings')}</div>,
          type: 'group',
          children: [
            {
              key: 'accounts',
              label: t('app.accounts'),
              icon: <BankOutlined />,
              onClick: () => { navigate(`/tenants/${tenantId}/settings/accounts`) }
            }, {
              key: 'budget',
              label: t('app.budget'),
              icon: <PieChartOutlined />,
              onClick: () => { navigate(`/tenants/${tenantId}/settings/budget`) }
            }
          ]
        }
      ]} />
    </>
  );
};

export default SettingsList;