import React from 'react';
import { useTranslation } from 'react-i18next';
import { moneyFormat } from '../constants';

interface MoneyProps {
  amount: number | undefined;
}

const Money: React.FC<MoneyProps> = ({ amount }) => {

  const { t } = useTranslation();

  return (
    <>
      {amount === undefined ? t('app.unknown') : moneyFormat.format(amount)}
    </>
  );
};

export default Money;