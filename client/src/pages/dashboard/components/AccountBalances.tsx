import { Card, Text, Tooltip, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowSwapRegular } from '@fluentui/react-icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { dateTimeFormat, moneyFormat } from '../../../constants';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import TableName from '../../../db/TableName';
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

const useStyles = makeStyles({
  widgetContainer: {
    position: 'relative',
    minWidth: '800px',
  },
  accountsGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    position: 'relative',
    zIndex: 1,
    overflowX: 'auto',
    paddingBottom: '12px',
    paddingRight: '4px',
  },
  accountCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    minWidth: '200px',
    flexShrink: 0,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 12px 24px ${tokens.colorNeutralShadowAmbient}, 0 6px 12px ${tokens.colorNeutralShadowKey}`,
    }
  },
  accountCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
    transition: 'opacity 0.3s ease',
  },
  accountCardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  accountName: {
    fontSize: '14px',
    fontWeight: '600',
    color: tokens.colorNeutralForegroundOnBrand,
  },
  accountBalance: {
    fontSize: '18px',
    fontWeight: '700',
    color: tokens.colorNeutralForegroundOnBrand,
  },
  accountMeta: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
    fontSize: '11px',
    color: tokens.colorNeutralForegroundOnBrand,
    opacity: 0.8,
  },
  transactionCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }
});

interface AccountBalancesProps {
  accounts: Array<Account>;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts }) => {
  const styles = useStyles();
  const { tenantId } = useParams();
  const { t } = useTranslation();
  const [balanceMap, setBalanceMap] = React.useState<Map<Account, AccountBalance>>(new Map());

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tenantId) return;
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts, tenantId]);

  function AccountCard({ account }: { account: Account }) {
    const [hover, setHover] = React.useState(false);
    const backgroundColor = pickRandomByHash(account.name, accountCardColors);
    
    // Create subtle gradient with transparency using CSS custom properties
    const subtleGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
      color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
      color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

    const hoverGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${backgroundColor} 40%, transparent) 0%, 
      color-mix(in srgb, ${backgroundColor} 25%, transparent) 50%, 
      color-mix(in srgb, ${backgroundColor} 20%, transparent) 100%)`;

    return (
      <Link 
        to={`/tenants/${tenantId}/transactions/${account.id}`} 
        onMouseEnter={() => setHover(true)} 
        onMouseLeave={() => setHover(false)}
        style={{ textDecoration: 'none' }}
      >
        <Card 
          className={styles.accountCard}
          style={{ 
            background: hover ? hoverGradient : subtleGradient,
            border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
            transform: hover ? 'scale(1.02)' : 'scale(1)',
            boxShadow: hover 
              ? `0 8px 24px color-mix(in srgb, ${backgroundColor} 30%, transparent), 0 4px 12px color-mix(in srgb, ${backgroundColor} 25%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 40%, transparent)`
              : `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
          }}
        >
          <div 
            className={styles.accountCardGradient}
            style={{ 
              background: `radial-gradient(circle at ${hover ? '80% 20%' : '20% 80%'}, 
                color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                transparent 60%)`,
              opacity: hover ? 1 : 0.8,
            }}
          />
          <div className={styles.accountCardContent}>
            <div className={styles.accountInfo}>
              <Text className={styles.accountName} truncate>
                {account.name}
              </Text>
              <Text className={styles.accountBalance}>
                {moneyFormat.format(balanceMap.get(account)?.balance ?? 0)}
              </Text>
            </div>
            <div className={styles.accountMeta}>
              <Tooltip content={dateTimeFormat.format(balanceMap.get(account)?.lastUpdate)} relationship="label">
                <span>{moment(balanceMap.get(account)?.lastUpdate).fromNow(true)} {t('app.ago')}</span>
            </Tooltip>
              <div className={styles.transactionCount}>
                <ArrowSwapRegular />
                <span>{balanceMap.get(account)?.transactionCount}</span>
              </div>
            </div>
        </div>
      </Card>
    </Link>
    );
  }

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.accountsGrid}>
        {accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedAccountBalances = () => {
  const { tenantId } = useParams();
  const EnhancedAccountBalances = enhance(AccountBalances);
  return <EnhancedAccountBalances tenantId={tenantId} />;
};
export default EnhancedAccountBalances;