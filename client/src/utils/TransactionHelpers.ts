import database from "../db/database";
import Transaction from "../db/models/Transaction";
import TableName from "../db/TableName";
import { ImportedTransaction } from "../services/import/import-adapter";

export interface TransactionRow {
  selected: boolean;
  id: string;
  date: Date;
  title: string;
  withdraw: number;
  deposit: number;
  classification: string;
  balance: number;
  raw: Transaction;
}

export interface AutoDetectedClassification {
  subCategoryId?: string;
  transferAccountId?: string;
}

/**
 * Auto-detects classifications for imported transactions based on existing transactions
 * Uses noise-removal and cleaned-title matching algorithm
 */
export const autoDetectClassifications = async (
  tenantId: string,
  accountId: string,
  importedTransactions: ImportedTransaction[]
): Promise<ImportedTransaction[]> => {
  if (!tenantId || !accountId || importedTransactions.length === 0) {
    return importedTransactions;
  }

  // Get all transactions for the selected account
  const accountTransactions = await database(tenantId).collections
    .get<Transaction>(TableName.Transactions)
    .query()
    .fetch();
  
  const selectedAccountTransactions = accountTransactions.filter(t => t.account.id === accountId);
  
  if (selectedAccountTransactions.length === 0) {
    return importedTransactions;
  }

  // Build token frequency table from existing transactions
  const tokenFrequency: Record<string, number> = {};
  const totalTransactions = selectedAccountTransactions.length;
  
  selectedAccountTransactions.forEach(transaction => {
    const tokens = transaction.title
      .toLowerCase()
      .replace(/[^a-z0-9@]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    tokens.forEach(token => {
      tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
    });
  });
  
  // Identify noise tokens (appearing in >10% of transactions)
  const noiseTokens = Object.entries(tokenFrequency)
    .filter(([token, count]) => count / totalTransactions > 0.1)
    .map(([token]) => token);
  
  // Regex patterns for noise
  const noisePatterns = [
    /\b\d{6,}\b/g, // long numbers
    /\b[a-z]{4,}\d{4,}\b/g, // bank codes
    /@[a-z]+/g, // UPI handles
    /\bupi\b|\bimps\b|\bneft\b|\bach\b|\bind\b|\bin\b|\bpvt\b|\bltd\b/gi, // common noise words
  ];
  
  // Clean a title function
  const cleanTitle = (title: string): string => {
    let cleaned = title.toLowerCase();
    
    // For UPI transactions, be more conservative with cleaning
    const isUPI = cleaned.includes('upi');
    
    if (isUPI) {
      // Specialized UPI cleaning that preserves important matching information
      
      // Step 1: Remove only the "UPI" keyword and very long transaction IDs
      cleaned = cleaned.replace(/\bupi\b/gi, ' '); // Remove UPI keyword
      cleaned = cleaned.replace(/\b\d{12,}\b/g, ' '); // Remove very long transaction IDs
      
      // Step 2: Remove common noise words
      const upiCommonNoise = [
        /\bimps\b|\bneft\b|\bach\b|\bind\b|\bin\b|\bpvt\b|\bltd\b/gi, // common noise words
      ];
      
      upiCommonNoise.forEach(pattern => {
        cleaned = cleaned.replace(pattern, ' ');
      });
      
      // Step 3: Clean up extra spaces and special characters
      cleaned = cleaned
        .replace(/[^a-z0-9 ]+/g, ' ') // Replace special chars with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // Step 4: Split into tokens and filter out very short tokens
      const tokens = cleaned.split(/\s+/).filter(token => 
        token && 
        token.length > 2 && // Keep tokens longer than 2 chars
        !noiseTokens.includes(token)
      );
      
      cleaned = tokens.join(' ');
    } else {
      // For non-UPI transactions, use the original aggressive cleaning
      noisePatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, ' ');
      });
      
      cleaned = cleaned
        .replace(/[^a-z0-9 ]+/g, ' ')
        .split(/\s+/)
        .filter(token => token && !noiseTokens.includes(token))
        .join(' ')
        .trim();
    }
    
    return cleaned;
  };
  
  // Build cleaned title to classification map from existing transactions
  const cleanedTitleToClassification: Record<string, AutoDetectedClassification> = {};
  
  selectedAccountTransactions.forEach(transaction => {
    const cleaned = cleanTitle(transaction.title);
    if (cleaned) {
      // Store both subcategory and transfer account if they exist
      const classification: AutoDetectedClassification = {};
      if (transaction.subCategory?.id) {
        classification.subCategoryId = transaction.subCategory.id;
      }
      if (transaction.transferAccount?.id) {
        classification.transferAccountId = transaction.transferAccount.id;
      }
      
      // Only store if we have at least one classification
      if (classification.subCategoryId || classification.transferAccountId) {
        cleanedTitleToClassification[cleaned] = classification;
      }
    }
  });
  
  // Update imported transactions with auto-detected classifications
  const result = importedTransactions.map(tx => {
    const currentClassification = (tx as unknown as { classification?: string }).classification || '';
    if (!currentClassification || currentClassification === '') {
      const cleanedTitle = cleanTitle(tx.title);
      const match = cleanedTitleToClassification[cleanedTitle];
      if (match) {
        const classification = JSON.stringify({ 
          ...match, 
          autoDetected: true 
        });
        return { ...tx, classification };
      }
    }
    return tx;
  });
  
  return result;
};

export const convertToTransactionRows = (transactions: Array<Transaction>, selectedTransactionIds: string[], initialBalance?: number): Array<TransactionRow> => {
  let prevBalance = initialBalance || 0;
  return transactions
    .sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime())
    .map((transaction) => {
      const row: TransactionRow = {
        selected: selectedTransactionIds.includes(transaction.id),
        id: transaction.id,
        date: transaction.transactionAt,
        title: transaction.title,
        withdraw: transaction.amount < 0 ? -transaction.amount : 0,
        deposit: transaction.amount > 0 ? transaction.amount : 0,
        classification: '',
        balance: prevBalance + transaction.amount,
        raw: transaction,
      };

      if (transaction.subCategory?.id) {
        row.classification = JSON.stringify({ subCategoryId: transaction.subCategory.id });
      } else if (transaction.transferAccount?.id) {
        row.classification = JSON.stringify({ transferAccountId: transaction.transferAccount.id });
      }

      prevBalance = row.balance;
      return row;
    }).reverse();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTransactionRow = async (tenantId: string, transaction: TransactionRow, columnName: string, updatedValue: any) => {
  switch (columnName) {
    case 'date': {
      await update(tenantId, transaction.raw, t => {
        t.transactionAt = updatedValue ?? new Date(0);
      });
      break;
    }

    case 'title': {
      await update(tenantId, transaction.raw, t => {
        t.title = updatedValue;
      });
      break;
    }

    case 'withdraw': {
      await update(tenantId, transaction.raw, t => {
        t.amount = -updatedValue;
      });
      break;
    }

    case 'deposit': {
      await update(tenantId, transaction.raw, t => {
        t.amount = updatedValue;
      });
      break;
    }

    case 'classification': {
      try {
        if (!updatedValue || !updatedValue.value) {
          await update(tenantId, transaction.raw, t => {
            if (t.subCategory) t.subCategory.id = null;
            if (t.transferAccount) t.transferAccount.id = null;
          });
          break;
        }

        const rawText = updatedValue.value;
        const classification = JSON.parse(rawText);
        if (classification.subCategoryId) {
          await update(tenantId, transaction.raw, t => {
            if (t.subCategory) t.subCategory.id = classification.subCategoryId;
            if (t.transferAccount) t.transferAccount.id = null;
          });
        }

        if (classification.transferAccountId) {
          await update(tenantId, transaction.raw, t => {
            if (t.transferAccount) t.transferAccount.id = classification.transferAccountId;
            if (t.subCategory) t.subCategory.id = null;
          });
        }
      } catch (e) {
        console.error(e);
      }
      break;
    }
  }
}

const update = async (tenantId: string, transaction: Transaction, updater: (t: Transaction) => void) => {
  return await database(tenantId).write(async () => {
    await transaction.update(updater);
  });
}
