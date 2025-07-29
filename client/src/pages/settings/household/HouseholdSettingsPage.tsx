import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, Input } from '@fluentui/react-components';
import { AddRegular, ChevronLeftRegular, DeleteRegular, DismissCircleRegular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import CustomButton from '../../../common/CustomButton';
import { withDialogTheme } from '../../../common/Dialog';
import { fluentColors } from '../../../constants';
import { Tenant } from '../../../services/entities/Tenant';
import { User } from '../../../services/entities/User';
import tenantService from '../../../services/tenant-service';
import { pickRandomByHash } from '../../../utils/Common';

const HouseholdSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) return;
      try {
        const tenantData = await tenantService.fetchTenant(tenantId);
        setTenant(tenantData);
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [tenantId]);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}/settings`);
  };

  const handleCreate = async () => {
    if (!tenantId || !tenant || !newUserEmail.trim()) return;
    
    setIsCreating(true);
    try {
      // Add the new email to the existing user emails
      const existingEmails = tenant.users.map(user => user.email);
      const updatedEmails = [...existingEmails, newUserEmail.trim()];
      
      // Call the tenant service to update users
      const updatedTenant = await tenantService.updateTenantUsers(tenantId, updatedEmails);
      setTenant(updatedTenant);
      setNewUserEmail('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!tenantId || !tenant) return;

    setIsDeleting(true);
    try {
      // Remove the user's email from the list
      const updatedEmails = tenant.users
        .filter(u => u.id !== user.id)
        .map(u => u.email);
      
      // Call the tenant service to update users
      const updatedTenant = await tenantService.updateTenantUsers(tenantId, updatedEmails);
      setTenant(updatedTenant);
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 app-content-height flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 app-content-height flex items-center justify-center">
        <div className="text-white">Tenant not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 app-content-height">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button 
              appearance="subtle" 
              icon={<ChevronLeftRegular />}
              onClick={handleBack}
            />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('app.household')}</h1>
              <p className="text-gray-400">{t('app.householdSettingsDescription')}</p>
            </div>
          </div>
          <CustomButton 
            variant="primary" 
            icon={<AddRegular />}
            onClick={() => setShowCreateDialog(true)}
          >
            {t('app.addMember')}
          </CustomButton>
        </div>
      </div>
      
      <div 
        className="rounded-xl p-6"
        style={{ backgroundColor: 'var(--ant-color-bg-container)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <th className="text-left py-3 px-4 font-medium text-white">{t('app.user')}</th>
                <th className="text-left py-3 px-4 font-medium text-white">{t('app.email')}</th>
                <th className="text-right py-3 px-4 font-medium text-white"></th>
              </tr>
            </thead>
            <tbody>
              {tenant.users.map(user => (
                <tr key={user.id} className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.picture && !imageErrors.has(user.id) ? (
                        <img 
                          src={user.picture} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(user.id));
                          }}
                        />
                      ) : (
                        <CustomAvatar 
                          size={40} 
                          char={user.name.charAt(0).toUpperCase()}
                          shape="circle"
                          color={pickRandomByHash(user.name, fluentColors)}
                        />
                      )}
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-300">{user.email}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {tenant.users.length === 1 ? (
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400">{t('app.cannotRemoveLastUser')}</span>
                      </div>
                    ) : user.id === tenant.users[0]?.id ? (
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400">{t('app.cannotRemoveSelf')}</span>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <CustomButton 
                          variant="subtle" 
                          icon={<DeleteRegular />}
                          onClick={() => setShowDeleteDialog(user)}
                          size="small"
                        >
                          {t('app.remove')}
                        </CustomButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Dialog */}
      {withDialogTheme(
        <Dialog open={showCreateDialog} onOpenChange={(e, data) => setShowCreateDialog(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                <h2 className="text-xl font-semibold text-white mb-4">{t('app.addMember')}</h2>
                {isCreating ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white">{t('app.processing')}...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">{t('app.email')}</label>
                      <Input 
                        type="email"
                        value={newUserEmail}
                        onChange={(e, data) => setNewUserEmail(data.value)}
                        placeholder={t('app.email')}
                        disabled={isCreating}
                      />
                    </div>
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <CustomButton 
                  variant="subtle" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  {t('app.cancel')}
                </CustomButton>
                <CustomButton 
                  variant="primary" 
                  onClick={handleCreate}
                  disabled={!newUserEmail.trim() || isCreating}
                >
                  {isCreating ? t('app.creating') : t('app.create')}
                </CustomButton>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      {withDialogTheme(
        <Dialog open={!!showDeleteDialog} onOpenChange={(e, data) => setShowDeleteDialog(data.open ? showDeleteDialog : null)}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                {isDeleting ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white">{t('app.processing')}...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <DismissCircleRegular style={{ color: 'red' }} />
                      <span className="font-semibold">{t('app.remove')} {t('app.user')} ?</span>
                    </div>
                    {showDeleteDialog && (
                      <>
                        <p className="mb-4">{t('app.deleteConfirmation', { entity: t('app.user') })}</p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-sm">
                            <strong>{showDeleteDialog.name}</strong> - {showDeleteDialog.email}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <CustomButton 
                  variant="subtle" 
                  onClick={() => setShowDeleteDialog(null)}
                  disabled={isDeleting}
                >
                  {t('app.no')}
                </CustomButton>
                <CustomButton 
                  variant="primary" 
                  onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
                  disabled={isDeleting}
                >
                  {isDeleting ? t('app.removing') : t('app.yes')}
                </CustomButton>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

export default HouseholdSettingsPage; 