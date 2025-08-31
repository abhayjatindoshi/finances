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
import Tranasction from '../../../db/models/Transaction';
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
  const [transactionMap, setTransactionMap] = React.useState<Map<string, Tranasction[]>>(new Map());

  useEffect(() => {
    const fetchBalancesAndTransactions = async () => {
      if (!tenantId) return;
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
      // Fetch transactions for all accounts
      const txCollection = database(tenantId).collections.get<Tranasction>('transactions');
      const txs = await txCollection.query().fetch();
      const map = new Map<string, Tranasction[]>();
      accounts.forEach(account => {
        map.set(
          account.id,
          txs.filter(tx => tx.account.id === account.id)
            .sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime())
        );
      });
      setTransactionMap(map);
    };
    fetchBalancesAndTransactions();
  }, [accounts, tenantId]);

  // Helper to get balance history for an account using real transactions
  function getBalanceHistory(account: Account, points = 16): number[] {
    const txs = transactionMap.get(account.id) || [];
    // Always include the initial balance as the first point
    const running: number[] = [account.initialBalance];
    let bal = account.initialBalance;
    for (const tx of txs) {
      bal += tx.amount;
      running.push(bal);
    }
    // If there are fewer than 2 points, flat line
    if (running.length < 2) {
      return Array(points).fill(account.initialBalance);
    }
    // Interpolate to fit exactly 'points' samples
    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      const pos = (i * (running.length - 1)) / (points - 1);
      const idx = Math.floor(pos);
      const frac = pos - idx;
      if (idx + 1 < running.length) {
        result.push(running[idx] * (1 - frac) + running[idx + 1] * frac);
      } else {
        result.push(running[running.length - 1]);
      }
    }
    return result;
  }

  function AccountCard({ account }: { account: Account }) {
    const [hover, setHover] = React.useState(false);
    const [cardWidth, setCardWidth] = React.useState(200); // default minWidth
    const cardRef = React.useRef<HTMLDivElement>(null);
    const backgroundColor = pickRandomByHash(account.name, accountCardColors);

    // Responsive: measure card width
    React.useLayoutEffect(() => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    }, []);

  // Chart data
  const history = getBalanceHistory(account, 16);
  const min = Math.min(...history);
  const max = Math.max(...history);
  // Chart occupies bottom 3/4 of the card
  const pad = 8;
  const w = cardWidth, h = 80; // even taller SVG for more area
  // Place chart in bottom 3/4: top padding is 1/4 of the SVG height
  const chartPadTop = Math.floor(h / 4);
  const chartPadBottom = pad;
    // Normalize points
    const pointsArr = history.map((v, i) => {
      const x = pad + ((w - 2 * pad) * i) / (history.length - 1);
      const y = h - chartPadBottom - ((h - chartPadTop - chartPadBottom) * (v - min)) / (max - min || 1);
      return [x, y];
    });
    const points = pointsArr.map(([x, y]) => `${x},${y}`).join(' ');

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
          {/* SVG line chart background - bottom half */}
          <div ref={cardRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, zIndex: 0, pointerEvents: 'none' }}>
            <svg width={w} height={h} style={{ width: '100%', height: h, opacity: 0.32, display: 'block' }}>
              {/* Subtle background below the line */}
              <defs>
                <linearGradient id={`area-gradient-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={backgroundColor} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={backgroundColor} stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <polygon
                points={
                  pointsArr.map(([x, y]) => `${x},${y}`).join(' ') +
                  ` ${w - pad},${h - chartPadBottom} ${pad},${h - chartPadBottom}`
                }
                fill={`url(#area-gradient-${account.id})`}
                opacity={1}
              />
              <polyline
                fill="none"
                stroke={backgroundColor}
                strokeWidth={3.2}
                points={points}
                style={{ filter: 'blur(0.2px)', opacity: 0.85 }}
              />
            </svg>
          </div>
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