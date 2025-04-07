import { CloseCircleOutlined, DeleteOutlined, EditOutlined, LeftOutlined, PlusOutlined, RightOutlined, SaveOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Input, Spin } from 'antd';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IconButton from '../../../common/IconButton';
import UserProfile from '../../../common/UserProfile';
import { Tenant } from '../../../services/entities/Tenant';
import { User } from '../../../services/entities/User';
import tenantService from '../../../services/tenant-service';
import { unsubscribeAll } from '../../../utils/ComponentUtils';
import { subscribeTo } from '../../../utils/GlobalVariable';

const TenantSettings: React.FC = () => {

  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [tenant, setTenant] = React.useState<Tenant | undefined>();
  const [edit, setEdit] = React.useState(false);
  const [newUserEmail, setNewUserEmail] = React.useState<string | undefined>();
  const [saving, setSaving] = React.useState(false);
  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);

  useEffect(() => {
    if (!tenantId) return;
    tenantService.fetchTenant(tenantId).then(setTenant);
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    const userSubscription = subscribeTo('user', (u) => setCurrentUser(u as User));
    return unsubscribeAll(screenSubscription, userSubscription);
  }, [tenantId]);

  const saveTenant = async () => {
    if (!tenant) return;
    setSaving(true);
    const updatedTenant = await tenantService.updateTenantName(tenant.id, tenant.name);
    setTenant(updatedTenant);
    setSaving(false);
    setEdit(false);
  };

  const addUser = async () => {
    if (!tenant || !newUserEmail) return;
    await updateUserList([...tenant.users.map(u => u.email), newUserEmail]);
    setNewUserEmail(undefined);
  };

  const removeUser = async (email: string) => {
    if (!tenant) return;
    return updateUserList(tenant.users.filter(u => u.email !== email).map(u => u.email));
  };

  const updateUserList = async (userEmails: Array<string>) => {
    if (!tenant) return;
    setSaving(true);
    const updatedTenant = await tenantService.updateTenantUsers(tenant.id, userEmails);
    setTenant(updatedTenant);
    setSaving(false);
  }

  return (!tenant ? <Spin /> :
    <div className='flex flex-col m-3'>
      <div className="flex items-center gap-2">
        {isPortrait && <LeftOutlined onClick={() => navigate(`/tenants/${tenantId}/settings`)} />}
        <div className='text-xl grow'>
          {edit ?
            <Input value={tenant.name} onChange={e => setTenant({ ...tenant, name: e.target.value })} /> :
            <Breadcrumb separator={<RightOutlined />} items={tenant.name.split('.').map(n => ({ title: n }))} />}
        </div>
        <div className='flex flex-row items-center gap-2'>
          {edit ?
            <>
              <IconButton type="primary" loading={saving} icon={<SaveOutlined />} onClick={saveTenant}>{t('app.save')}</IconButton>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => setEdit(false)}>{t('app.cancel')}</IconButton>
            </> :
            <>
              <IconButton icon={<EditOutlined />} onClick={() => setEdit(true)}>{t('app.edit')}</IconButton>
              <IconButton danger disabled icon={<DeleteOutlined />}>{t('app.delete')}</IconButton>
            </>
          }
        </div>
      </div>
      <div className="text-xl mt-7">{t('app.users')}</div>
      <div className='flex flex-col gap-2 mt-2'>
        {tenant.users.map(user => (
          <div key={user.id} className="flex items-center gap-2 p-2 bg-zinc-950 hover:bg-zinc-800 rounded-md group cursor-pointer">
            <UserProfile name={user.name ?? user.email} profileImage={user.picture} size={'large'} />
            <div className='flex flex-col grow'>
              <div className='text-lg'>{user.name ?? ''}</div>
              <div className='text-sm text-zinc-400'>{user.email}</div>
            </div>
            <IconButton className='invisible group-hover:visible'
              disabled={tenant.users.length < 2 || user.id === currentUser?.id} danger
              icon={<DeleteOutlined />} loading={saving}
              onClick={() => removeUser(user.email)}>{t('app.remove')}</IconButton>
          </div>
        ))}
        <div key="add">
          {newUserEmail === undefined ?
            <Button icon={<PlusOutlined />} disabled={saving} onClick={() => setNewUserEmail('')}>{t('app.add')} {t('app.user')}</Button> :
            <div className='flex flex-row gap-2'>
              <Input type='text' autoFocus value={newUserEmail}
                disabled={saving} placeholder={t('app.email')}
                onChange={e => setNewUserEmail(e.target.value)}
                onBlur={() => setNewUserEmail(undefined)}
                onPressEnter={addUser} />
              <Button icon={<PlusOutlined />} loading={saving} type='primary' onClick={addUser}>{t('app.add')}</Button>
            </div>}
        </div>
      </div>
    </div>
  );
};

export default TenantSettings;