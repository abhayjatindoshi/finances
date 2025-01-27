export enum BankMedium {
  SavingsAccount = 'Savings Account',
  CreditCard = 'Credit Card',
}

export enum ImportFormat {
  Excel = 'Excel',
  PDF = 'PDF',
  Unknown = "Unknown",
}

export interface ImportedData {
  bankMedium: BankMedium;
  importFormat: ImportFormat;
  transactions: Array<ImportedTransaction>;
}

export interface ImportedTransaction {
  id: number;
  transactionAt: Date;
  title: string;
  summary: string;
  amount: number;
}

export interface ImportAdapter {
  name: string;
  supportedFileTypes: ImportFormat[] | ((fileType: string) => boolean);
  isCompatibleFile(file: File): Promise<boolean>;
  import(file: File): Promise<ImportedData>;
}