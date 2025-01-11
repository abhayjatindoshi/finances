import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToAllTransactionsPage: React.FC = () => {

  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/transactions/all`);
  });

  return (
    <></>
  );
};

export default RedirectToAllTransactionsPage;