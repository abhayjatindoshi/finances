import { CheckOutlined, CloseCircleOutlined, ImportOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { Select, Table, Typography, Upload } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Account from '../../../db/models/Account';
import IconButton from '../../../common/IconButton';
import { detectImportFormat, ImportFormat, RawTransaction, readTransactions } from '../../../utils/FileUtils';
import Money from '../../../common/Money';
import database from '../../../db/database';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import Time from '../../../common/Time';
import { useParams } from 'react-router-dom';

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
  const [file, setFile] = React.useState<File>();
  const [importFormat, setImportFormat] = React.useState<ImportFormat | undefined>();
  const [transactions, setTransactions] = React.useState<RawTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<RawTransaction[]>([]);

  function handleUpload(file: File): boolean {
    setStatus(ImportStatus.Detecting);
    detectImportFormat(file).then(format => {
      setFile(file);
      setImportFormat(format);
      setStatus(ImportStatus.Detected);
    })
    return false;
  }

  async function readData() {
    if (importFormat === undefined || file === undefined) return;
    setStatus(ImportStatus.Reading);
    const transactions = await readTransactions(importFormat, file);
    setTransactions(transactions.sort((a, b) => b.transactionAt.getTime() - a.transactionAt.getTime()));
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
          {importFormat !== undefined ?
            <div><b>{t('app.detectedFormat')}: </b>{ImportFormat[importFormat]}</div> :
            <>
              <div>{t('app.formatNotDetected')}</div>
              <Select placeholder={t('app.selectFormat')} value={importFormat} onChange={setImportFormat} className='mb-4'>
                <Select.Option value={ImportFormat.JUPITER}>{t('app.jupiter')}</Select.Option>
                <Select.Option value={ImportFormat.HDFC}>{t('app.hdfc')}</Select.Option>
              </Select>
            </>
          }
          <div className='flex flex-row gap-2'>
            <IconButton type='primary' icon={<CheckOutlined />} onClick={() => readData()}>{t('app.continue')}</IconButton>
            <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
          </div>
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
              <div><b>Found Transactions:</b> {transactions.length} </div>
              <div><b>Selected Transactions:</b> {selectedTransactions.length} </div>
            </div>
            <div className='flex flex-row gap-2'>
              <IconButton icon={<ImportOutlined />} type="primary" disabled={selectedTransactions.length === 0} onClick={importData}>{t('app.import')}</IconButton>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => setStatus(ImportStatus.Waiting)}>{t('app.cancel')}</IconButton>
            </div>
          </div>
          <Table dataSource={transactions} pagination={false} size='small' rowSelection={{ type: 'checkbox', onChange: (_, selectedTransactions) => setSelectedTransactions(selectedTransactions) }} rowKey="id">
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
    </>
  );
};

export default ImportPage;