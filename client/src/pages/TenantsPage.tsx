import React, { useEffect } from 'react';
import { Tenant } from '../services/entities/Tenant';
import tenantService from '../services/tenant-service';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const TenantsPage: React.FC = () => {

  const [tenants, setTenants] = React.useState<Tenant[]>([]);

  useEffect(() => {
    tenantService.fetchAllTenants()
      .then(setTenants);
  }, []);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function tenantToFolders(tenants: Tenant[]): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.log(root);
    return root;
  }
  const folders = tenantToFolders(tenants);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TenantFolders = ({ folders }: { folders: any }) => {
    return <>{Object.entries(folders)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div className="flex flex-col items-start mt-24 mx-auto overflow-auto">
        <TenantFolders folders={folders} />
      </div>
    </Layout>
  );
};

export default TenantsPage;