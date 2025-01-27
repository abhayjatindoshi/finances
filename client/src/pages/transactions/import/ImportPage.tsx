import { CheckOutlined, CloseCircleOutlined, ImportOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { Card, Table, Typography, Upload } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Account from '../../../db/models/Account';
import IconButton from '../../../common/IconButton';
import Money from '../../../common/Money';
import database from '../../../db/database';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import Time from '../../../common/Time';
import { useParams } from 'react-router-dom';
import importService, { CompatibleBank } from '../../../services/import/import-service';
import { ImportedData, ImportedTransaction } from '../../../services/import/import-adapter';

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
  const { Column } = Table;
  const { Dragger } = Upload;
  const { Text } = Typography;
  const { tenantId } = useParams();
  const [status, setStatus] = React.useState<ImportStatus>(ImportStatus.Waiting);
  const [compatibleBanks, setCompatibleBanks] = React.useState<Array<CompatibleBank>>([]);
  const [importedData, setImportedData] = React.useState<ImportedData | undefined>();
  const [selectedTransactions, setSelectedTransactions] = React.useState<Array<ImportedTransaction>>([]);

  function handleUpload(file: File): boolean {
    importTransactions(file);
    return false;
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
        <Dragger className='block w-full' multiple={false} maxCount={1} beforeUpload={handleUpload}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>{t('app.uploadText')}</p>
          <p className='ant-upload-hint'>{t('app.uploadHint')}</p>
        </Dragger>
      }

      {status === ImportStatus.Detecting &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center'>
            <LoadingOutlined className='text-2xl mr-2' />
            <div>{t('app.detectingFormat')}...</div>
          </div>
          <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
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
                  <Card key={bank.name} className='cursor-pointer' hoverable onClick={() => readData(bank)} >{bank.name}</Card>
                )}
              </div>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
            </>
          }
        </div>
      }

      {status === ImportStatus.Reading &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center'>
            <LoadingOutlined className='text-2xl mr-2' />
            <div>{t('app.readingTransactions')}...</div>
          </div>
          <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
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
              <IconButton icon={<ImportOutlined />} type="primary" disabled={selectedTransactions.length === 0} onClick={importData}>{t('app.import')}</IconButton>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
            </div>
          </div>
          <Table dataSource={importedData?.transactions} pagination={false} size='small' rowSelection={{ type: 'checkbox', onChange: (_, selectedTransactions) => setSelectedTransactions(selectedTransactions) }} rowKey="id">
            <Column title={t('app.time')} dataIndex='transactionAt' key='transactionAt' render={(transactionAt: Date) => <Time time={transactionAt} />} />
            <Column title={t('app.title')} dataIndex='title' key='title' render={(title: string) => <Text ellipsis className='w-48'>{title}</Text>} />
            <Column title={t('app.withdraw')} dataIndex='amount' key='amount' className='text-right' render={(amount: number) => amount < 0 ? <Money amount={-amount} /> : ''} />
            <Column title={t('app.deposit')} dataIndex='amount' key='amount' className='text-right' render={(amount: number) => { return amount > 0 ? <Money amount={(amount)} /> : '' }} />
          </Table>
        </div>
      }

      {status === ImportStatus.Completed &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center gap-2'>
            <CheckOutlined className='text-2xl' />
            {selectedTransactions.length} {t('app.transactionsImported')}
          </div>
          <IconButton icon={<CloseCircleOutlined />} onClick={() => { setStatus(ImportStatus.Waiting); onClose && onClose(); }}>{t('app.close')}</IconButton>
        </div>
      }

      {status === ImportStatus.Error &&
        <div className='flex flex-col items-center gap-4'>
          <div className='flex flex-row items-center gap-2'>
            <CloseCircleOutlined className='text-2xl' />
            {t('app.formatNotSupported')}
          </div>
          <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.close')}</IconButton>
        </div>
      }
    </>
  );
};

export default ImportPage;