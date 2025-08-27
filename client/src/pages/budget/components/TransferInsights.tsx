import { tokens } from '@fluentui/react-components';
import { ArrowSwapRegular } from '@fluentui/react-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, withDialogTheme } from '../../../common/Dialog';
import { dateTimeFormat, moneyFormat } from '../../../constants';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import Transaction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
export type TransferPair = {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  total: number;
  count: number;
  missing: number;
  mismatched: number;
  mismatchDelta: number;
  transactions: Transaction[];
  missingTxs: Transaction[];
  mismatchedTxs: { tx: Transaction; counterpartAmount: number; delta: number }[];
};
export type Group = { aId: string; bId: string; aName: string; bName: string; ab?: TransferPair; ba?: TransferPair };

const TransferInsights: React.FC = () => {
  const [selectedPair, setSelectedPair] = React.useState<TransferPair | null>(null);
  const { tenantId } = useParams();
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [transferPairs, setTransferPairs] = React.useState<TransferPair[] | null>(null);

  // Group transferPairs by from account for display (must be after transferPairs is declared)
  const fromAccounts = React.useMemo(() => {
    if (!transferPairs) return [] as Array<[string, {
      fromName: string;
      toAccounts: Array<{ toId: string; toName: string; pair: TransferPair }>;
      missing: number;
      mismatched: number;
      totalErrors: number;
    }]>;
    const map = new Map<string, {
      fromName: string;
      toAccounts: Array<{ toId: string; toName: string; pair: TransferPair }>;
      missing: number;
      mismatched: number;
      totalErrors: number;
    }>();
    transferPairs.forEach(p => {
      let entry = map.get(p.fromId);
      if (!entry) entry = { fromName: p.fromName, toAccounts: [], missing: 0, mismatched: 0, totalErrors: 0 };
      entry.toAccounts.push({ toId: p.toId, toName: p.toName, pair: p });
      entry.missing += p.missing;
      entry.mismatched += p.mismatched;
      entry.totalErrors = entry.missing + entry.mismatched;
      map.set(p.fromId, entry);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].totalErrors - a[1].totalErrors || a[1].fromName.localeCompare(b[1].fromName));
  }, [transferPairs]);
  // Removed selectedPair and setSelectedPair (not used)

  // Card UI copied from BudgetSummaryPage
  const cardBaseStyle: React.CSSProperties = {
    background: 'linear-gradient(120deg, rgba(8,10,14,0.98) 0%, rgba(16,18,22,0.98) 100%)',
    backdropFilter: 'blur(2.5px)',
    WebkitBackdropFilter: 'blur(2.5px)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    boxShadow: '0 4px 24px 0 #000c, 0 1.5px 8px #0008, inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003',
    borderRadius: 18,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: tokens.colorNeutralForegroundOnBrand,
    marginBottom: 24,
    transition: 'box-shadow 0.2s, filter 0.2s',
    cursor: 'default',
    minWidth: 340,
    gap: 0,
  };
  const cardHoverStyle: React.CSSProperties = {
    boxShadow: '0 0 0 1px rgba(96,165,250,0.25), 0 10px 36px 0 #000f, 0 4px 16px #000a, inset 0 2.5px 12px #fff2, inset 0 -2.5px 12px #0004',
    filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.12))',
  };

  // Fetch and compute transfer pairs
  React.useEffect(() => {
    if (!tenantId) return;
    const fetchData = async () => {
      try {
        const [transactions, accounts] = await Promise.all([
          database(tenantId).collections.get<Transaction>(TableName.Transactions).query().fetch(),
          database(tenantId).collections.get<Account>(TableName.Accounts).query().fetch(),
        ]);
        const accountNameById: Record<string, string> = {};
        accounts.forEach((a: Account) => { accountNameById[a.id] = a.name; });
        const pairMap: Record<string, Record<string, TransferPair>> = {};
        transactions.forEach((tx: Transaction) => {
          const fromId = tx.account.id;
          const toId = tx.transferAccount?.id;
          if (!toId) return;
          if (!pairMap[fromId]) pairMap[fromId] = {};
          if (!pairMap[fromId][toId]) {
            pairMap[fromId][toId] = {
              fromId,
              toId,
              fromName: accountNameById[fromId] || fromId,
              toName: accountNameById[toId] || toId,
              total: 0,
              count: 0,
              missing: 0,
              mismatched: 0,
              mismatchDelta: 0,
              transactions: [],
              missingTxs: [],
              mismatchedTxs: [],
            };
          }
          const pair = pairMap[fromId][toId];
          pair.total += tx.amount;
          pair.count += 1;
          pair.transactions.push(tx);
        });
        const toDateKey = (d: Date) => {
          const dt = d instanceof Date ? d : new Date(d);
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const da = String(dt.getDate()).padStart(2, '0');
          return `${y}-${m}-${da}`;
        };
        Object.values(pairMap).forEach(row => {
          Object.values(row).forEach(pair => {
            const reversed = pairMap[pair.toId]?.[pair.fromId];
            const revIndex: Record<string, { tx: Transaction; used: boolean }[]> = {};
            if (reversed) {
              reversed.transactions.forEach((rtx: Transaction) => {
                const key = toDateKey(rtx.transactionAt);
                (revIndex[key] = revIndex[key] || []).push({ tx: rtx, used: false });
              });
            }
            const EPS = 0.009;
            const byDate: Record<string, Transaction[]> = {};
            pair.transactions.forEach((tx: Transaction) => {
              const key = toDateKey(tx.transactionAt);
              (byDate[key] = byDate[key] || []).push(tx);
            });
            const filteredTxs: Transaction[] = [];
            Object.values(byDate).forEach(arr => {
              const used: boolean[] = new Array(arr.length).fill(false);
              for (let i = 0; i < arr.length; i++) {
                if (used[i]) continue;
                let matched = false;
                for (let j = i + 1; j < arr.length; j++) {
                  if (used[j]) continue;
                  const a = arr[i].amount;
                  const b = arr[j].amount;
                  if (a === 0 || b === 0) continue;
                  if (Math.sign(a) !== Math.sign(b) && Math.abs(a + b) <= EPS) {
                    used[i] = true;
                    used[j] = true;
                    matched = true;
                    break;
                  }
                }
                if (!matched) filteredTxs.push(arr[i]);
              }
            });
            filteredTxs.forEach((tx: Transaction) => {
              const dt = tx.transactionAt instanceof Date ? tx.transactionAt : new Date(tx.transactionAt);
              const key = toDateKey(dt);
              const prev = new Date(dt); prev.setDate(prev.getDate() - 1);
              const next = new Date(dt); next.setDate(next.getDate() + 1);
              const prevKey = toDateKey(prev);
              const nextKey = toDateKey(next);
              const candidates = [
                ...(revIndex[key] || []),
                ...(revIndex[nextKey] || []),
                ...(revIndex[prevKey] || []),
              ];
              const target = -tx.amount;
              let idx = candidates.findIndex(c => !c.used && Math.abs(c.tx.amount - target) <= EPS);
              if (idx === -1) {
                let bestIdx = -1;
                let bestDiff = Number.POSITIVE_INFINITY;
                for (let i = 0; i < candidates.length; i++) {
                  const c = candidates[i];
                  if (c.used) continue;
                  const diff = Math.abs(c.tx.amount - target);
                  if (diff < bestDiff) {
                    bestDiff = diff;
                    bestIdx = i;
                  }
                }
                idx = bestIdx;
              }
              if (idx === -1) {
                pair.missing += 1;
                pair.missingTxs.push(tx);
              } else {
                const cp = candidates[idx];
                cp.used = true;
                const delta = tx.amount + cp.tx.amount;
                if (Math.abs(delta) > EPS) {
                  pair.mismatched += 1;
                  pair.mismatchDelta += Math.abs(delta);
                  pair.mismatchedTxs.push({ tx, counterpartAmount: cp.tx.amount, delta });
                }
              }
            });
          });
        });
        let pairs: TransferPair[] = [];
        Object.values(pairMap).forEach(row => {
          Object.values(row).forEach((p: TransferPair) => { if (p.count > 0) pairs.push(p); });
        });
        pairs = pairs.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
        setTransferPairs(pairs);
      } catch (e) {
        setTransferPairs([]);
      }
    };
    fetchData();
  }, [tenantId]);

  // Removed onOpenPair (not used)

  return (
    <div
      style={{
        ...cardBaseStyle,
        ...(hovered === 'transfers' ? cardHoverStyle : {}),
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      onMouseEnter={() => setHovered('transfers')}
      onMouseLeave={() => setHovered(null)}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: tokens.colorNeutralForegroundOnBrand, marginBottom: 8 }}>Transfer Insights</div>
      <div style={{ color: tokens.colorNeutralForeground3, fontSize: 13, marginBottom: 8 }}>Grouped by source (from) account. Click a card to expand/collapse.</div>
      {fromAccounts.length === 0 && (
        <div style={{ color: '#34d399', fontWeight: 500, fontSize: 16, padding: 12 }}>No transfers found between accounts.</div>
      )}
      {fromAccounts.map(([fromId, acc]) => {
        const isOpen = !!expanded[fromId];
        return (
          <div
            key={fromId}
            style={{
              background: 'rgba(24,28,36,0.92)',
              border: '1px solid #2226',
              borderRadius: 14,
              boxShadow: '0 2px 8px #0006',
              marginBottom: 6,
              minWidth: 340,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => setExpanded(e => ({ ...e, [fromId]: !e[fromId] }))}
          >
            {/* Collapsed summary row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{acc.fromName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {acc.missing > 0 && (
                  <div title={`Missing: ${acc.missing}`} style={{ background: 'rgba(248,113,113,0.16)', border: '1px solid #b91c1c55', color: '#fecaca', borderRadius: 999, padding: '4px 8px', fontSize: 13 }}>
                    ⚠️ {acc.missing}
                  </div>
                )}
                {acc.mismatched > 0 && (
                  <div title={`Mismatched: ${acc.mismatched}`} style={{ background: 'rgba(251,191,36,0.16)', border: '1px solid #b4530955', color: '#fde68a', borderRadius: 999, padding: '4px 8px', fontSize: 13 }}>
                    ⚡ {acc.mismatched}
                  </div>
                )}
                <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 15, marginLeft: 8 }}>{isOpen ? '▼' : '▶'}</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ width: 'calc(320px * 1.5 + 14px * 0.5)', maxWidth: '100%', overflowX: 'auto', paddingBottom: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    gap: 14,
                    padding: '0 0 16px 16px',
                  }}
                >
                  {acc.toAccounts.map(({ toId, toName, pair }) => (
                    <div
                      key={toId}
                      style={{
                        background: 'rgba(36,40,48,0.98)',
                        border: '1px solid #2226',
                        borderRadius: 10,
                        padding: '18px 20px',
                        minWidth: 260,
                        maxWidth: 320,
                        marginTop: 14,
                        marginBottom: 4,
                        marginLeft: 2,
                        marginRight: 2,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 12,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                        <div style={{ fontSize: 15, color: '#fff' }}>{toName}</div>
                        <div style={{ fontSize: 28, color: pair.missing > 0 ? '#f87171' : pair.mismatched > 0 ? '#fbbf24' : '#34d399', lineHeight: 1.2 }}>{moneyFormat.format(pair.total)}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 40 }}>
                        <div
                          title={`${pair.count} transactions`}
                          style={{
                            background: 'rgba(148,163,184,0.18)',
                            border: '1px solid #2a2f3a',
                            color: '#cbd5e1',
                            borderRadius: 999,
                            padding: '2px 6px',
                            fontSize: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontWeight: 400,
                          }}
                        >
                          <ArrowSwapRegular style={{ width: 12, height: 12 }} />
                          <span style={{ fontWeight: 400 }}>{pair.count}</span>
                        </div>
                        {(pair.missing > 0 || pair.mismatched > 0) && (
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedPair(pair);
                            }}
                            title={
                              pair.missing > 0 && pair.mismatched > 0
                                ? `${pair.missing} missing counterpart${pair.missing > 1 ? 's' : ''}, ${pair.mismatched} mismatched; Total Δ ${moneyFormat.format(pair.mismatchDelta)}`
                                : pair.missing > 0
                                  ? `${pair.missing} missing counterpart${pair.missing > 1 ? 's' : ''}`
                                  : `${pair.mismatched} mismatched; Total Δ ${moneyFormat.format(pair.mismatchDelta)}`
                            }
                            style={{
                              background: pair.missing > 0 && pair.mismatched > 0
                                ? 'linear-gradient(90deg, rgba(248,113,113,0.16) 60%, rgba(251,191,36,0.16) 100%)'
                                : pair.missing > 0
                                  ? 'rgba(248,113,113,0.16)'
                                  : 'rgba(251,191,36,0.16)',
                              border: pair.missing > 0 && pair.mismatched > 0
                                ? '1px solid #b91c1c55'
                                : pair.missing > 0
                                  ? '1px solid #b91c1c55'
                                  : '1px solid #b4530955',
                              color: pair.missing > 0 && pair.mismatched > 0
                                ? '#fde68a'
                                : pair.missing > 0
                                  ? '#fecaca'
                                  : '#fde68a',
                              borderRadius: 999,
                              padding: '2px 6px',
                              fontSize: 10,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                              fontWeight: 400,
                            }}
                          >
                            {pair.missing > 0 && <><span>⚠️</span><span style={{ fontWeight: 400 }}>{pair.missing}</span></>}
                            {pair.missing > 0 && pair.mismatched > 0 && <span style={{ fontWeight: 400, margin: '0 1px' }}>/</span>}
                            {pair.mismatched > 0 && <><span>⚡</span><span style={{ fontWeight: 400 }}>{pair.mismatched}</span></>}
                          </div>
                        )}
      {/* Modal for transfer pair details */}
      {withDialogTheme(
        <Dialog open={!!selectedPair} onOpenChange={(_e: unknown, data: { open: boolean }) => { if (!data.open) { setSelectedPair(null); } }}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                {selectedPair && (() => {
                  const hasMissing = selectedPair.missingTxs.length > 0;
                  const hasMismatch = selectedPair.mismatchedTxs.length > 0;
                  const totalDelta = selectedPair.mismatchedTxs.reduce((s, m) => s + Math.abs(m.delta), 0);
                  return (
                    <div style={{ minWidth: 420, color: tokens.colorNeutralForegroundOnBrand, padding: 8 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}>{selectedPair.fromName}</div>
                          <div style={{ fontSize: 13, color: '#a3a3a3' }}>→ {selectedPair.toName}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {hasMissing && (
                            <div title={`${selectedPair.missingTxs.length} missing counterpart${selectedPair.missingTxs.length > 1 ? 's' : ''}`}
                              style={{ background: 'rgba(248,113,113,0.16)', border: '1px solid #b91c1c55', color: '#fecaca', borderRadius: 999, padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span>⚠️</span>
                              <span>{selectedPair.missingTxs.length}</span>
                            </div>
                          )}
                          {hasMismatch && (
                            <div title={`${selectedPair.mismatchedTxs.length} mismatched; Total Δ ${moneyFormat.format(totalDelta)}`}
                              style={{ background: 'rgba(251,191,36,0.16)', border: '1px solid #b4530955', color: '#fde68a', borderRadius: 999, padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span>⚡</span>
                              <span>{selectedPair.mismatchedTxs.length}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Missing list (only if present) */}
                      {hasMissing && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6, color: '#f87171' }}>Missing</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {selectedPair.missingTxs.map(tx => (
                              <div key={tx.id}
                                title={`Expected in ${selectedPair.toName}: ${moneyFormat.format(-tx.amount)} on same day`}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(24,28,36,0.92)', border: '1px solid #2226', borderRadius: 8, padding: '8px 10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: 12, color: tokens.colorNeutralForeground3 }}>
                                    {dateTimeFormat.format(tx.transactionAt instanceof Date ? tx.transactionAt : new Date(tx.transactionAt))}
                                    <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
                                    <span style={{ color: tokens.colorNeutralForeground2 }}>{selectedPair.fromName}</span>
                                  </span>
                                  <span style={{ fontSize: 14, color: tokens.colorNeutralForegroundOnBrand, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title || tx.summary || '-'}</span>
                                </div>
                                <div style={{ fontSize: 14, color: '#f87171' }}>{moneyFormat.format(tx.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mismatched list (only if present) */}
                      {hasMismatch && (
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 6, color: '#fbbf24' }}>Mismatched</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {selectedPair.mismatchedTxs.map(({ tx, counterpartAmount, delta }) => (
                              <div key={tx.id}
                                title={`From ${selectedPair.fromName}: ${moneyFormat.format(tx.amount)} → ${selectedPair.toName}: ${moneyFormat.format(counterpartAmount)} | Δ ${moneyFormat.format(delta)}`}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(24,28,36,0.92)', border: '1px solid #2226', borderRadius: 8, padding: '8px 10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: 12, color: tokens.colorNeutralForeground3 }}>
                                    {dateTimeFormat.format(tx.transactionAt instanceof Date ? tx.transactionAt : new Date(tx.transactionAt))}
                                    <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
                                    <span style={{ color: tokens.colorNeutralForeground2 }}>{selectedPair.fromName}</span>
                                    <span style={{ margin: '0 6px', opacity: 0.5 }}>→</span>
                                    <span style={{ color: tokens.colorNeutralForeground2 }}>{selectedPair.toName}</span>
                                  </span>
                                  <span style={{ fontSize: 14, color: tokens.colorNeutralForegroundOnBrand, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title || tx.summary || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                  <div style={{ fontSize: 14, color: '#fbbf24' }}>
                                    {moneyFormat.format(tx.amount)}
                                    <span style={{ margin: '0 6px', opacity: 0.6 }}>→</span>
                                    {moneyFormat.format(counterpartAmount)}
                                  </div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: Math.abs(delta) > 0.01 ? '#f87171' : '#34d399' }}>Δ {moneyFormat.format(delta)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </DialogContent>
              <DialogActions>
                <button onClick={() => setSelectedPair(null)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tokens.colorBrandBackground, color: tokens.colorBrandForeground1, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Close</button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
        <span style={{ color: '#f87171', fontWeight: 600 }}>⚠️</span> missing entries; <span style={{ color: '#fbbf24', fontWeight: 600 }}>⚡</span> mismatched amounts.<br />
        Click a card to expand/collapse and see details for each destination account.
      </div>
      {/* TODO: Add dialog for selectedPair if needed */}
    </div>
  );
};

export default TransferInsights;

// ...existing imports and types...

// The correct, single implementation of TransferInsights:

