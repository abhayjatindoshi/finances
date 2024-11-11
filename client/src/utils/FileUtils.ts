import { read, utils } from "xlsx";
import moment from "moment";
import Transaction from "../db/models/Transaction";

export enum ImportFormat {
  JUPITER
}

const readUploadedFile = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file);
  })
}

const readExcelFile = (file: ArrayBuffer): Array<string[][]> => {
  const convertedSheets = new Array<string[][]>();
  const workbook = read(file);
  for (let i in workbook.SheetNames) {
    let sheet = workbook.Sheets[workbook.SheetNames[i]];
    let range = utils.decode_range(sheet["!ref"]!)
    let allRows: string[][] = [];
    for (let rowIndex = 0; rowIndex <= range.e.r; rowIndex++) {
      let row: string[] = [];
      for (let colIndex = 0; colIndex <= range.e.c; colIndex++) {
        let cellIndex = utils.encode_cell({ c: colIndex, r: rowIndex });
        row.push(sheet[cellIndex]?.v ?? "");
      }
      allRows.push(row);
    }
    convertedSheets.push(allRows);
  }
  return convertedSheets;
}

export const importStatementFromExcel = async (format: ImportFormat, file: File): Promise<Transaction[]> => {
  let stream = await readUploadedFile(file);
  let sheets = readExcelFile(stream);
  switch (format) {
    case ImportFormat.JUPITER: return importJupiterFormat(sheets);
  }
}

const importJupiterFormat = (sheets: Array<string[][]>): Transaction[] => {
  let transactions: Transaction[] = [];
  for (let i = 0; i < sheets.length; i++) {
    let sheet = sheets[i];
    for (let rowIndex = 0; rowIndex < sheet.length; rowIndex++) {
      let row = sheet[rowIndex];
      if (!/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(row[0])) continue;
      let transaction: any = {};
      transaction.id = transactions.length + 1;
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
  let num = Number.parseFloat(value);
  return isNaN(num) ? 0 : num;
}