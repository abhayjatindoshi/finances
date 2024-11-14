import { read, utils } from "xlsx";
import moment from "moment";
import Transaction from "../db/models/Transaction";
import database from "../db/database";

export enum ImportFormat {
  JUPITER
}

const readUploadedFile = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file);
  })
}

const readExcelFile = (file: ArrayBuffer): Array<string[][]> => {
  const convertedSheets = new Array<string[][]>();
  const workbook = read(file);
  for (const i in workbook.SheetNames) {
    const sheet = workbook.Sheets[workbook.SheetNames[i]];
    const range = utils.decode_range(sheet["!ref"]!)
    const allRows: string[][] = [];
    for (let rowIndex = 0; rowIndex <= range.e.r; rowIndex++) {
      const row: string[] = [];
      for (let colIndex = 0; colIndex <= range.e.c; colIndex++) {
        const cellIndex = utils.encode_cell({ c: colIndex, r: rowIndex });
        row.push(sheet[cellIndex]?.v ?? "");
      }
      allRows.push(row);
    }
    convertedSheets.push(allRows);
  }
  return convertedSheets;
}

export const importStatementFromExcel = async (format: ImportFormat, file: File): Promise<Transaction[]> => {
  const stream = await readUploadedFile(file);
  const sheets = readExcelFile(stream);
  switch (format) {
    case ImportFormat.JUPITER: return importJupiterFormat(sheets);
  }
}

const importJupiterFormat = async (sheets: Array<string[][]>): Promise<Transaction[]> => {
  const transactions: Transaction[] = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    for (let rowIndex = 0; rowIndex < sheet.length; rowIndex++) {
      const row = sheet[rowIndex];
      if (!/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(row[0])) continue;
      const t = database.collections.get<Transaction>('transactions');

      const transaction = await t.create(r => r)
      transaction.transactionAt = moment(row[0], 'DD/MM/YYYY').toDate();
      transaction.title = row[2];
      transaction.summary = row[2];
      transaction.amount = parseFloatNumber(row[6]) - parseFloatNumber(row[5]);
      transactions.push(transaction);
    }
  }
  return transactions;
}

const parseFloatNumber = (value: string): number => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? 0 : num;
}