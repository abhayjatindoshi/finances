import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import TableName from '../../db/TableName';
import Account from '../../db/models/Account';
import { useNavigate } from 'react-router-dom';
import database from '../../db/database';

interface RedirectToFirstAccountPageProps {
  accounts: Array<Account>;
}

const RedirectToFirstAccountPage: React.FC<RedirectToFirstAccountPageProps> = ({ accounts }) => {

  const navigate = useNavigate();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      navigate(`/accounts/${accounts[0].id}`);
    }
  });

  return (
    <></>
  );
};

const enhance = withObservables([], () => ({
  accounts: database().collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedRedirectToFirstAccountPage = enhance(RedirectToFirstAccountPage);
export default EnhancedRedirectToFirstAccountPage;