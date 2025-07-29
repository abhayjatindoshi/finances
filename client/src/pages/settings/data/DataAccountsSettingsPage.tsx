import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, Input, tokens } from '@fluentui/react-components';
import { AddRegular, ArrowSwapRegular, ChevronLeftRegular, DeleteRegular, DismissCircleRegular, EditRegular, MoneyRegular, SaveRegular } from '@fluentui/react-icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import CustomButton from '../../../common/CustomButton';
import { withDialogTheme } from '../../../common/Dialog';
import Money from '../../../common/Money';
import TableName from '../../../db/TableName';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import Transaction from '../../../db/models/Transaction';
import { pickRandomByHash } from '../../../utils/Common';
import { AccountBalance, getBalanceMap } from '../../../utils/DbUtils';

// FluentUI theme color values for account cards
const accountCardColors = [
  tokens.colorBrandBackground,
  tokens.colorPalettePurpleBackground2,
  tokens.colorPaletteTealBackground2,
  tokens.colorPaletteGreenBackground2,
  tokens.colorPaletteCranberryBackground2,
  tokens.colorPalettePinkBackground2,
  tokens.colorPaletteRedBackground2,
  tokens.colorPaletteDarkOrangeBackground2,
  tokens.colorPaletteYellowBackground2,
  tokens.colorPaletteDarkRedBackground2,
  tokens.colorPaletteCornflowerBackground2,
  tokens.colorPaletteGoldBackground2,
  tokens.colorPaletteSeafoamBackground2,
];

interface DataAccountsSettingsPageProps {
  accounts: Array<Account>
}

interface RawAccount {
  id: string;
  name: string;
  initialBalance: number;
}

const defaultAccount: RawAccount = { id: '', name: '', initialBalance: 0 };

const DataAccountsSettingsPage: React.FC<DataAccountsSettingsPageProps> = ({ accounts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [balanceMap, setBalanceMap] = React.useState<Map<Account, AccountBalance>>(new Map());
  const [editingAccount, setEditingAccount] = useState<RawAccount | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Account | null>(null);
  const [dependencyCounts, setDependencyCounts] = useState<Map<string, number>>(new Map());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAccount, setNewAccount] = useState<RawAccount>(defaultAccount);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tenantId) return;
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts, tenantId]);

  useEffect(() => {
    const fetchDependencyCounts = async () => {
      if (!tenantId) return;
      const counts = new Map<string, number>();
      for (const account of accounts) {
        const count = await database(tenantId).collections.get<Transaction>(TableName.Transactions)
          .query(Q.where('account_id', account.id))
          .fetchCount();
        counts.set(account.id, count);
      }
      setDependencyCounts(counts);
    };
    fetchDependencyCounts();
  }, [accounts, tenantId]);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}/settings`);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount({
      id: account.id,
      name: account.name,
      initialBalance: account.initialBalance,
    });
  };

  const handleSave = async () => {
    if (!tenantId || !editingAccount) return;
    
    const dbAccount = accounts.find(a => a.id === editingAccount.id);
    if (!dbAccount) return;

    await database(tenantId).write(async () => {
      await dbAccount.update(a => {
        a.name = editingAccount.name;
        a.initialBalance = editingAccount.initialBalance;
      });
    });
    
    setEditingAccount(null);
  };

  const handleCancel = () => {
    setEditingAccount(null);
  };

  const handleCreate = async () => {
    if (!tenantId) return;
    
    await database(tenantId).write(async () => {
      await database(tenantId).collections.get<Account>(TableName.Accounts)
        .create(a => {
          a.name = newAccount.name;
          a.initialBalance = newAccount.initialBalance;
        });
    });
    
    setNewAccount(defaultAccount);
    setShowCreateDialog(false);
  };

  const handleDelete = async (account: Account) => {
    if (!tenantId) return;
    const dependencyCount = dependencyCounts.get(account.id) || 0;
    if (dependencyCount > 0) return;

    await database(tenantId).write(async () => {
      await account.markAsDeleted();
    });
    
    setShowDeleteDialog(null);
  };

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
              <h1 className="text-3xl font-bold text-white mb-2">{t('app.accounts')}</h1>
              <p className="text-gray-400">{t('app.manageAccounts')}</p>
            </div>
          </div>
          <CustomButton 
            variant="primary" 
            icon={<AddRegular />}
            onClick={() => setShowCreateDialog(true)}
          >
            {t('app.add')} {t('app.account')}
          </CustomButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => {
          const backgroundColor = pickRandomByHash(account.name, accountCardColors);
          const subtleGradient = `linear-gradient(135deg, 
            color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
            color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
            color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

          return (
            <div 
              key={account.id}
              className="rounded-lg p-4 relative overflow-hidden min-h-[100px] flex items-center"
              style={{ 
                background: subtleGradient,
                border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
                boxShadow: `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
              }}
            >
              <div 
                className="absolute top-0 left-0 right-0 bottom-0 rounded-lg"
                style={{ 
                  background: `radial-gradient(circle at 20% 80%, 
                    color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                    transparent 60%)`,
                  opacity: 0.8,
                }}
              />
              <div className="relative z-10 flex flex-1 items-center justify-between w-full">
                {editingAccount?.id === account.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">{t('app.name')}</label>
                      <Input 
                        value={editingAccount.name}
                        onChange={(e, data) => setEditingAccount({ ...editingAccount, name: data.value })}
                        className="w-full"
                        placeholder={t('app.name')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">{t('app.initialBalance')}</label>
                      <Input 
                        type="number"
                        value={editingAccount.initialBalance.toString()}
                        onChange={(e, data) => setEditingAccount({ ...editingAccount, initialBalance: parseFloat(data.value) || 0 })}
                        contentBefore={t('app.currency')}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <CustomButton variant="primary" icon={<SaveRegular />} onClick={handleSave} size="small">
                        {t('app.save')}
                      </CustomButton>
                      <CustomButton variant="subtle" icon={<DismissCircleRegular />} onClick={handleCancel} size="small">
                        {t('app.cancel')}
                      </CustomButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="text-white font-medium text-lg truncate">{account.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <CustomButton variant="subtle" icon={<EditRegular />} onClick={() => handleEdit(account)} size="small">
                          {t('app.edit')}
                        </CustomButton>
                        <CustomButton 
                          variant="subtle" 
                          icon={<DeleteRegular />}
                          disabled={(dependencyCounts.get(account.id) || 0) > 0}
                          onClick={() => setShowDeleteDialog(account)}
                          size="small"
                        >
                          {t('app.delete')}
                        </CustomButton>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[90px] ms-4">
                      <div className="flex items-center gap-2">
                        <MoneyRegular style={{ fontSize: '22px', color: '#3b82f6' }} />
                        <span className="text-2xl text-white font-bold"><Money amount={balanceMap.get(account)?.balance || 0} /></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowSwapRegular style={{ fontSize: '18px', color: '#f59e0b' }} />
                        <span className="text-xs text-gray-300 font-medium">{dependencyCounts.get(account.id) || 0}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Account Dialog */}
      {withDialogTheme(
        <Dialog open={showCreateDialog} onOpenChange={(e, data) => setShowCreateDialog(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                <h2 className="text-xl font-semibold text-white mb-4">{t('app.add')} {t('app.account')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">{t('app.name')}</label>
                    <Input 
                      value={newAccount.name}
                      onChange={(e, data) => setNewAccount({ ...newAccount, name: data.value })}
                      placeholder={t('app.name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">{t('app.initialBalance')}</label>
                    <Input 
                      type="number"
                      value={newAccount.initialBalance.toString()}
                      onChange={(e, data) => setNewAccount({ ...newAccount, initialBalance: parseFloat(data.value) || 0 })}
                      contentBefore={t('app.currency')}
                      placeholder="0"
                    />
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <CustomButton variant="subtle" onClick={() => setShowCreateDialog(false)}>
                  {t('app.cancel')}
                </CustomButton>
                <CustomButton 
                  variant="primary" 
                  onClick={handleCreate}
                  disabled={!newAccount.name.trim()}
                >
                  {t('app.create')}
                </CustomButton>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Delete Account Dialog */}
      {withDialogTheme(
        <Dialog open={!!showDeleteDialog} onOpenChange={(e, data) => setShowDeleteDialog(data.open ? showDeleteDialog : null)}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                <div className="flex items-center gap-2 mb-4">
                  <DismissCircleRegular style={{ color: 'red' }} />
                  <span className="font-semibold">{t('app.delete')} {t('app.account')} ?</span>
                </div>
                {showDeleteDialog && (
                  <>
                    <p className="mb-4">{t('app.deleteConfirmation', { entity: t('app.account') })}</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        <strong>{showDeleteDialog.name}</strong> - {t('app.initialBalance')}: <Money amount={showDeleteDialog.initialBalance} />
                      </p>
                      {(dependencyCounts.get(showDeleteDialog.id) || 0) > 0 && (
                        <p className="text-red-600 text-sm mt-1">
                          {t('app.cannotDelete', { count: dependencyCounts.get(showDeleteDialog.id), entity: t('app.transactions') })}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <CustomButton variant="subtle" onClick={() => setShowDeleteDialog(null)}>
                  {t('app.no')}
                </CustomButton>
                <CustomButton 
                  variant="primary" 
                  onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
                  disabled={showDeleteDialog ? (dependencyCounts.get(showDeleteDialog.id) || 0) > 0 : true}
                >
                  {t('app.yes')}
                </CustomButton>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
}));

const EnhancedDataAccountsSettingsPage = () => {
  const { tenantId } = useParams();
  const EnhancedDataAccountsSettingsPage = enhance(DataAccountsSettingsPage);
  return <EnhancedDataAccountsSettingsPage tenantId={tenantId} />;
};

export default EnhancedDataAccountsSettingsPage;
