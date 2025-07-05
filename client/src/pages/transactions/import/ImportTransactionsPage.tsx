import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import Category from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Transaction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { ImportedTransaction } from '../../../services/import/import-adapter';
import importService from '../../../services/import/import-service';
import { autoDetectClassifications } from '../../../utils/TransactionHelpers';
import AccountSelectionStep from './AccountSelectionStep';
import ProcessingStep from './ProcessingStep';
import TransactionPreviewStep from './TransactionPreviewStep';
import UploadStep from './UploadStep';

interface ImportTransactionsPageProps {
  accounts: Array<Account>;
  categories: Array<Category>;
  subCategories: Array<SubCategory>;
}

// Main Import Transactions Page Component
const ImportTransactionsPage: React.FC<ImportTransactionsPageProps> = ({ accounts, categories, subCategories }) => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'select-account' | 'preview' | 'processing'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [importedTransactions, setImportedTransactions] = useState<ImportedTransaction[]>([]);

  const handleFileUploaded = useCallback(async (files: File[]) => {
    if (files.length === 0 || !files[0]) return;
    
    setIsUploading(true);
    try {
      // Find compatible banks for the uploaded file
      const compatibleBanks = await importService.findCompatibleBanks(files[0]);
      if (compatibleBanks.length === 0) {
        throw new Error('No compatible bank found for this file');
      }
      
      // Use the first compatible bank (or let user select if multiple)
      const bank = compatibleBanks[0];
      
      // Import the transactions
      const importedData = await bank.import();
      setImportedTransactions(importedData.transactions);
      
      setUploadedFiles(files);
      setImportStep('select-account');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAccountSelect = useCallback((account: Account) => {
    setSelectedAccount(account);
  }, []);

  const handleContinueToPreview = useCallback(async () => {
    if (!selectedAccount || !tenantId) return;
    
    // Auto-detect categories for imported transactions based on previous transactions
    if (importedTransactions.length > 0) {
      const updatedTransactions = await autoDetectClassifications(
        tenantId,
        selectedAccount.id,
        importedTransactions
      );
      setImportedTransactions(updatedTransactions);
    }
    
    setImportStep('preview');
  }, [selectedAccount, importedTransactions, tenantId]);

  const handleContinueToProcessing = useCallback(async (selectedTransactions: ImportedTransaction[]) => {
    if (!selectedAccount || !tenantId) return;
    
    setImportStep('processing');
    try {
      // Import the transactions to the database
      await database(tenantId).write(async () => {
        const transactionCollection = database(tenantId).collections.get<Transaction>(TableName.Transactions);
        const promises = selectedTransactions.map(transaction => {
          return transactionCollection.create(t => {
            t.account.set(selectedAccount);
            t.transactionAt = transaction.transactionAt;
            t.title = transaction.title;
            t.summary = transaction.title;
            t.amount = transaction.amount;
            
            // Handle classification if present
            if ((transaction as unknown as { classification?: string }).classification) {
              try {
                const classification = JSON.parse((transaction as unknown as { classification: string }).classification);
                if (classification.subCategoryId) {
                  // Find the subcategory and set it
                  const subCategory = subCategories.find(s => s.id === classification.subCategoryId);
                  if (subCategory && t.subCategory) {
                    t.subCategory.set(subCategory);
                  }
                }
                if (classification.transferAccountId) {
                  // Find the transfer account and set it
                  const transferAccount = accounts.find(a => a.id === classification.transferAccountId);
                  if (transferAccount && t.transferAccount) {
                    t.transferAccount.set(transferAccount);
                  }
                }
              } catch (e) {
                console.error('Error parsing classification:', e);
              }
            }
          });
        });
        await Promise.all(promises);
      });
      
      // Redirect to the account's transactions page
      navigate(`/tenants/${tenantId}/transactions/${selectedAccount.id}`);
    } catch (error) {
      console.error('Import processing failed:', error);
      setImportStep('preview');
    }
  }, [selectedAccount, tenantId, subCategories, accounts, navigate]);

  const handleBackToUpload = useCallback(() => {
    setUploadedFiles([]);
    setSelectedAccount(null);
    setImportedTransactions([]);
    setImportStep('upload');
  }, []);

  const handleBackToAccountSelection = useCallback(() => {
    setImportStep('select-account');
  }, []);

  // Render based on current step
  if (importStep === 'select-account') {
    return (
      <AccountSelectionStep
        accounts={accounts}
        uploadedFiles={uploadedFiles}
        selectedAccount={selectedAccount}
        onAccountSelect={handleAccountSelect}
        onBack={handleBackToUpload}
        onContinue={handleContinueToPreview}
      />
    );
  }

  if (importStep === 'preview') {
    if (!selectedAccount) return null;
    return (
      <TransactionPreviewStep
        importedTransactions={importedTransactions}
        setImportedTransactions={setImportedTransactions}
        selectedAccount={selectedAccount}
        onBack={handleBackToAccountSelection}
        onContinue={handleContinueToProcessing}
      />
    );
  }

  if (importStep === 'processing') {
    return <ProcessingStep selectedAccount={selectedAccount} />;
  }

  // Default upload step
  return (
    <UploadStep
      onFileUploaded={handleFileUploaded}
      isUploading={isUploading}
    />
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(),
}));

const EnhancedImportTransactionsPage = () => {
  const { tenantId } = useParams();
  const EnhancedImportTransactionsPage = enhance(ImportTransactionsPage);
  return <EnhancedImportTransactionsPage tenantId={tenantId} />;
};

export default EnhancedImportTransactionsPage;