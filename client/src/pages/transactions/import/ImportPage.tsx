import { Card, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Text } from '@fluentui/react-components';
import { ArrowImportRegular, CheckmarkRegular, DismissCircleRegular, DocumentRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import IconButton from '../../../common/IconButton';
import Money from '../../../common/Money';
import Time from '../../../common/Time';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { ImportedData, ImportedTransaction } from '../../../services/import/import-adapter';
import importService, { CompatibleBank } from '../../../services/import/import-service';

interface ImportPageProps {
  account: Account;
  onClose?: () => void;
}

enum ImportStatus {
  Waiting,
  Detecting,
  Detected,
  Reading,
  Success,
  Error,
  Completed
}

const ImportPage: React.FC<ImportPageProps> = ({ account, onClose }) => {

  const { t } = useTranslation();
  const { tenantId } = useParams();
  const [status, setStatus] = React.useState<ImportStatus>(ImportStatus.Waiting);
  const [compatibleBanks, setCompatibleBanks] = React.useState<Array<CompatibleBank>>([]);
  const [importedData, setImportedData] = React.useState<ImportedData | undefined>();
  const [selectedTransactions, setSelectedTransactions] = React.useState<Array<ImportedTransaction>>([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      importTransactions(file);
    }
  }

  async function importTransactions(file: File) {
    if (!file) return;
    const compatibleBanks = await importService.findCompatibleBanks(file);
    if (compatibleBanks.length === 0) {
      setStatus(ImportStatus.Error);
      return;
    } else if (compatibleBanks.length === 1) {
      readData(compatibleBanks[0]);
      setStatus(ImportStatus.Detected);
    } else {
      setCompatibleBanks(compatibleBanks);
      setStatus(ImportStatus.Detected);
    }
  }

  async function readData(compatibleBank: CompatibleBank) {
    setStatus(ImportStatus.Reading);
    setCompatibleBanks([compatibleBank]);
    const importedData = await compatibleBank.import();
    setImportedData(importedData);
    setSelectedTransactions([]);
    setStatus(ImportStatus.Success);
  }

  function importData() {
    if (!tenantId) return;
    if (selectedTransactions.length === 0) return;
    database(tenantId).write(async () => {
      const transactionCollection = database(tenantId).collections.get<Tranasction>(TableName.Transactions);
      const promises = selectedTransactions.map(transaction => transactionCollection.create(t => {
        t.account.set(account);
        t.transactionAt = transaction.transactionAt;
        t.title = transaction.title;
        t.summary = transaction.title;
        t.amount = transaction.amount;
      }));
      await Promise.all(promises);
      setStatus(ImportStatus.Completed);
    });
  }

  return (
    <>
      {status === ImportStatus.Waiting &&
        <div className='block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className='text-4xl mb-4'>
              <DocumentRegular />
            </div>
            <div className='text-lg font-semibold'>{t('app.uploadText')}</div>
            <div className='text-sm text-gray-500'>{t('app.uploadHint')}</div>
          </label>
        </div>
      }

      {status === ImportStatus.Detecting &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center'>
            <Spinner size="medium" className='mr-2' />
            <div>{t('app.detectingFormat')}...</div>
          </div>
          <IconButton icon={<DismissCircleRegular />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
        </div>
      }

      {status === ImportStatus.Detected &&
        <div className='flex flex-col items-center gap-4'>
          {compatibleBanks.length === 1 ?
            <div><b>{t('app.detectedFormat')}: </b>{compatibleBanks[0].name}</div> :
            <>
              <div>{t('app.formatNotDetected')}</div>
              <div className='flex flex-row gap-4'>
                {compatibleBanks.map(bank =>
                  <Card key={bank.name} className='cursor-pointer hover:shadow-lg' onClick={() => readData(bank)} >{bank.name}</Card>
                )}
              </div>
              <IconButton icon={<DismissCircleRegular />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
            </>
          }
        </div>
      }

      {status === ImportStatus.Reading &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center'>
            <Spinner size="medium" className='mr-2' />
            <div>{t('app.readingTransactions')}...</div>
          </div>
          <IconButton icon={<DismissCircleRegular />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
        </div>
      }

      {status === ImportStatus.Success &&
        <div>
          <div className='flex flex-row'>
            <div className='grow flex flex-col'>
              <div><b>Bank:</b> {compatibleBanks[0].name} {importedData?.bankMedium}</div>
              <div><b>File Format:</b> {importedData?.importFormat}</div>
              <div><b>Found Transactions:</b> {importedData?.transactions.length} </div>
              <div><b>Selected Transactions:</b> {selectedTransactions.length} </div>
            </div>
            <div className='flex flex-row gap-2'>
              <IconButton icon={<ArrowImportRegular />} appearance="primary" disabled={selectedTransactions.length === 0} onClick={importData}>{t('app.import')}</IconButton>
              <IconButton icon={<DismissCircleRegular />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>{t('app.time')}</TableHeaderCell>
                <TableHeaderCell>{t('app.title')}</TableHeaderCell>
                <TableHeaderCell>{t('app.withdraw')}</TableHeaderCell>
                <TableHeaderCell>{t('app.deposit')}</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importedData?.transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell><Time time={transaction.transactionAt} /></TableCell>
                  <TableCell><Text truncate className='w-48'>{transaction.title}</Text></TableCell>
                  <TableCell className='text-right'>{transaction.amount < 0 ? <Money amount={-transaction.amount} /> : ''}</TableCell>
                  <TableCell className='text-right'>{transaction.amount > 0 ? <Money amount={transaction.amount} /> : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }

      {status === ImportStatus.Completed &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center gap-2'>
            <CheckmarkRegular className='text-2xl' />
            {selectedTransactions.length} {t('app.transactionsImported')}
          </div>
          <IconButton icon={<DismissCircleRegular />} onClick={() => { setStatus(ImportStatus.Waiting); onClose && onClose(); }}>{t('app.close')}</IconButton>
        </div>
      }

      {status === ImportStatus.Error &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center gap-2'>
            <DismissCircleRegular className='text-2xl' />
            {t('app.formatNotSupported')}
          </div>
          <IconButton icon={<DismissCircleRegular />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.close')}</IconButton>
        </div>
      }
    </>
  );
};

export default ImportPage;