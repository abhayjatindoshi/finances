import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../common/IconButton';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col items-center gap-5 mt-48 text-xl'>
      {t('app.errorPage')}
      <Link to='/'>
        <IconButton icon={<HomeOutlined />}>
          {t('app.home')}
        </IconButton>
      </Link>
    </div>
  );
};

export default ErrorPage;