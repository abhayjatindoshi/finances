import React from 'react';
import { useTranslation } from 'react-i18next';

const AccountSettingsPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <div>
      {t('app.myAccount')}
    </div>
  );
};

export default AccountSettingsPage;