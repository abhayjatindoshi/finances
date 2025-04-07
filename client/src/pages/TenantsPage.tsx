/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Input, Layout, Modal, Spin } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '../common/IconButton';
import { Tenant } from '../services/entities/Tenant';
import tenantService from '../services/tenant-service';

interface TenantsPageProps {
  tenants: Tenant[];
}

const TenantsPage: React.FC<TenantsPageProps> = ({ tenants }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [newTenantName, setNewTenantName] = React.useState('');
  const [showNewTenantModal, setShowNewTenantModal] = React.useState(false);

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
            className='flex flex-row justify-between w-72 bg-zinc-900 hover:bg-zinc-800 p-3 ml-5 rounded'>
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

  const createTenant = async () => {
    const tenant = await tenantService.createTenant(newTenantName);
    navigate(`/tenants/${tenant.id}/settings/tenant`);
  }

  return (
    <Layout>
      {tenants.length === 0 ?
        <div className='flex flex-col gap-2 h-screen items-center justify-center'>
          <Spin percent="auto" size='large' />
          <div className='text-xl'>{t('app.loggingIn')}</div>
        </div> :
        <div className="flex flex-col items-start mt-24 mx-auto overflow-auto">
          <TenantFolders folders={folders} />
          <IconButton className='mt-5 ml-10' icon={<PlusOutlined />} onClick={() => setShowNewTenantModal(true)}>
            {t('app.new')}
          </IconButton>
          <Modal open={showNewTenantModal} title={t('app.new') + ' ' + t('app.tenant')}
            onCancel={() => setShowNewTenantModal(false)}
            onOk={createTenant}>
            <Input placeholder={t('app.tenant') + ' ' + t('app.name')}
              value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} />
          </Modal>
        </div>
      }
    </Layout>
  );
};

export default TenantsPage;