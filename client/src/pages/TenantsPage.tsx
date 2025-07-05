/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, Spinner } from '@fluentui/react-components';
import { AddRegular, ChevronRightRegular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, withDialogTheme } from '../common/Dialog';
import IconButton from '../common/IconButton';
import { Tenant } from '../services/entities/Tenant';
import tenantService from '../services/tenant-service';
import { tenantToFolders } from '../utils/TenantUtils';

const TenantsPage: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTenantName, setNewTenantName] = useState('');
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);

  useEffect(() => {
    async function loadTenants() {
      try {
        const tenants = await tenantService.fetchAllTenants();
        setTenants(tenants);
      } catch (error) {
        console.error('Failed to load tenants:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTenants();
  }, []);

  const folders = tenantToFolders(tenants);
  const TenantFolders = ({ folders }: { folders: any }) => {
    return <>{Object.entries(folders)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .map(([key, value]: [string, any]) => {
        if ('name' in value) {
          return <Link to={`/tenants/${value.id}`} key={value.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '20rem',
              padding: '0.5rem',
              backgroundColor: 'var(--colorNeutralBackground3)',
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--colorNeutralBackground2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--colorNeutralBackground3)';
            }}>
            <div>{key}</div>
            <ChevronRightRegular />
          </Link>
        } else {
          return <div className='mb-4' key={key}>
            <div className='text-2xl m-2 font-semibold'>{key}</div>
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
    setShowNewTenantModal(false);
  }

  return (
    <div className="min-h-screen">
      {loading ?
        <div className='flex flex-col gap-2 h-screen items-center justify-center'>
          <Spinner size="large" />
          <div className='text-xl'>{t('app.loadingTenants')}</div>
        </div> :
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="flex flex-col items-center overflow-auto">
          <TenantFolders folders={folders} />
            <IconButton className='mt-6' icon={<AddRegular />} onClick={() => setShowNewTenantModal(true)}>
            {t('app.new')}
          </IconButton>
          </div>
          {withDialogTheme(
            <Dialog open={showNewTenantModal} onOpenChange={(e, data) => setShowNewTenantModal(data.open)}>
              <DialogSurface>
                <DialogBody>
                  <DialogContent>
                    <h2 className="text-xl font-semibold mb-4">{t('app.new')} {t('app.tenant')}</h2>
                    <Input 
                      placeholder={t('app.tenant') + ' ' + t('app.name')}
                      value={newTenantName} 
                      onChange={(e, data) => setNewTenantName(data.value)} 
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button appearance="subtle" onClick={() => setShowNewTenantModal(false)}>
                      {t('app.cancel')}
                    </Button>
                    <Button appearance="primary" onClick={createTenant}>
                      {t('app.create')}
                    </Button>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          )}
        </div>
      }
    </div>
  );
};

export default TenantsPage;