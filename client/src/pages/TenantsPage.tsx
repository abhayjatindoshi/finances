/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Tenant } from '../services/entities/Tenant';
import { Link } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TenantsPageProps {
  tenants: Tenant[];
}

const TenantsPage: React.FC<TenantsPageProps> = ({ tenants }) => {

  const { t } = useTranslation();

  function tenantToFolders(tenants: Tenant[]): any {
    const root: any = {};
    tenants.forEach(tenant => {
      const keys = tenant.name.split('.');
      let currentLevel = root;
      keys.forEach((key, index) => {
        if (!currentLevel[key]) {
          currentLevel[key] = index === keys.length - 1 ? tenant : {};
        }
        currentLevel = currentLevel[key];
      });
    });
    return root;
  }

  const folders = tenantToFolders(tenants);
  const TenantFolders = ({ folders }: { folders: any }) => {
    return <>{Object.entries(folders)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .map(([key, value]: [string, any]) => {
        if ('name' in value) {
          return <Link to={`/tenants/${value.id}`} key={value.id}
            className='flex flex-row justify-between w-72 bg-zinc-900 hover:bg-zinc-800 p-3 rounded'>
            <div className=''>{key}</div>
            <RightOutlined />
          </Link>
        } else {
          return <div className='ml-10' key={key}>
            <div className='text-2xl m-2'>{key}</div>
            <div className='flex flex-col gap-2'>
              <TenantFolders folders={value} />
            </div>
          </div>
        }
      })}
    </>
  };

  return (
    <Layout>
      {tenants.length === 0 ?
        <div className='flex flex-col gap-2 h-screen items-center justify-center'>
          <Spin percent="auto" size='large' />
          <div className='text-xl'>{t('app.loggingIn')}</div>
        </div> :
        <div className="flex flex-col items-start mt-24 mx-auto overflow-auto">
          <TenantFolders folders={folders} />
        </div>
      }
    </Layout>
  );
};

export default TenantsPage;