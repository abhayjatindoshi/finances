import { HomeRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import IconButton from '../common/IconButton';

const ErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const error = new URLSearchParams(window.location.search).get('error') ?? 'app.errorPage';

  return (
    <div className='flex flex-col items-center gap-5 mt-48 text-xl'>
      {error.startsWith('app.') ? t(error) : error}
      <Link to='/'>
        <IconButton icon={<HomeRegular />}>
          {t('app.home')}
        </IconButton>
      </Link>
    </div>
  );
};

export default ErrorPage;