import React from 'react';
import { useTranslation } from 'react-i18next';

interface MoneyProps {
  amount: number | undefined;
}

const Money: React.FC<MoneyProps> = ({ amount }) => {

  const { t } = useTranslation();
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <>
      {amount === undefined ? t('app.unknown') : formatter.format(amount)}
    </>
  );
};

export default Money;