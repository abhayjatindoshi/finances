import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Tenant } from '../services/entities/Tenant';
import tenantService from '../services/tenant-service';
import Toolbar from '../toolbar/Toolbar';
import { createGlobalVariable } from '../utils/GlobalVariable';
import SyncProgress from './SyncProgress';

function AppLayout() {

  const isScreenLandscape = createGlobalVariable<boolean>('isScreenLandscape');

  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const resizeHelper = () => {
      const { innerWidth, innerHeight } = window;
      isScreenLandscape.next(innerWidth > innerHeight);
    }
    window.addEventListener('resize', resizeHelper);
    resizeHelper();

    return () => window.removeEventListener('resize', resizeHelper);
  }, [isScreenLandscape]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const fetchedTenants = await tenantService.fetchAllTenants();
        setTenants(fetchedTenants);
      } catch (error) {
        console.error('Failed to load tenants:', error);
      }
    };

    loadTenants();
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>
      <header className="flex-shrink-0">
        <Toolbar tenants={tenants} />
      </header>
      <main className='flex-1 overflow-auto'>
        <SyncProgress />
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;