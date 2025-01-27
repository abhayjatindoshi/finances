import { read, utils } from "xlsx";
import moment from "moment";
import pdfToText from 'react-pdftotext'

export enum ImportFormat {
  JUPITER,
  HDFC,
  FEDERAL,
  UNKNOWN
}

export interface RawTransaction {
  id: number;
  transactionAt: Date;
  title: string;
  summary: string;
  amount: number;
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

const excelBufferToSheets = (file: ArrayBuffer): Array<string[][]> => {
  const convertedSheets = new Array<string[][]>();
  const workbook = read(file);
  for (const i in workbook.SheetNames) {
    const sheet = workbook.Sheets[workbook.SheetNames[i]];
    if (!sheet["!ref"]) continue;
    const range = utils.decode_range(sheet["!ref"])
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

export const detectImportFormat = async (file: File): Promise<ImportFormat> => {
  if (file.type === 'application/pdf') {
    return ImportFormat.FEDERAL;
  } else if (file.type.indexOf('sheet') !== -1) {
    const workbook = await readExcelFile(file);
    return detectImportFormatOfExcelFile(workbook)
  } else {
    return ImportFormat.UNKNOWN;
  }
}

export const readExcelFile = async (file: File): Promise<Array<string[][]>> => {
  const stream = await readUploadedFile(file);
  return excelBufferToSheets(stream);
}

export const readTransactions = async (format: ImportFormat, file: File): Promise<RawTransaction[]> => {
  switch (format) {
    case ImportFormat.JUPITER: return importJupiterFormat(await readExcelFile(file));
    case ImportFormat.HDFC: return importHdfcFormat(await readExcelFile(file));
    case ImportFormat.FEDERAL: return importFederalFormat(file);
    default: return [];
  }
}

const detectImportFormatOfExcelFile = (workbook: Array<string[][]>): ImportFormat => {
  for (let i = 0; i < workbook.length; i++) {
    const sheet = workbook[i];
    for (let rowIndex = 0; rowIndex < sheet.length; rowIndex++) {
      const row = sheet[rowIndex];
      if (row[0].toUpperCase().indexOf('HDFC') !== -1) {
        return ImportFormat.HDFC;
      }

      if (row.filter(c => c.toUpperCase().indexOf('JUPITER') !== -1).length > 0) {
        return ImportFormat.JUPITER;
      }
    }
  }
  return ImportFormat.UNKNOWN;
}

const importJupiterFormat = (sheets: Array<string[][]>): RawTransaction[] => {
  const transactions: RawTransaction[] = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    let index = 0;
    for (let rowIndex = 0; rowIndex < sheet.length; rowIndex++) {
      const row = sheet[rowIndex];
      if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(row[0])) continue;

      const transaction = {
        id: index++,
        transactionAt: moment(row[0], 'DD/MM/YYYY').toDate(),
        title: row[2],
        summary: row[2],
        amount: parseFloatNumber(row[6]) - parseFloatNumber(row[5])
      }
      transactions.push(transaction);
    }
  }
  return transactions;
}

const importHdfcFormat = (sheets: Array<string[][]>): RawTransaction[] => {
  const transactions: RawTransaction[] = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    let index = 0;
    for (let rowIndex = 0; rowIndex < sheet.length; rowIndex++) {
      const row = sheet[rowIndex];
      if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{2}$/.test(row[0])) continue;

      const transaction = {
        id: index++,
        transactionAt: moment(row[0], 'DD/MM/YY').toDate(),
        title: row[1],
        summary: row[1],
        amount: parseFloatNumber(row[5]) - parseFloatNumber(row[4])
      }
      transactions.push(transaction);
    }
  }
  return transactions;
}


const importFederalFormat = async (file: File): Promise<RawTransaction[]> => {
  const pdf = await pdfToText(file);
  const rows = pdf.replaceAll(/(Cr|Dr)/g, '$1\n')
    .replaceAll(/([0-9]{2}-[0-9]{2}-[0-9]{4})/g, '\n$1')
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^[0-9]{2}-[0-9]{2}-[0-9]{4}/.test(line))
    .map(line => line.split(/[\s]{2,}/)
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0))
    .filter(row => {
      if (row.length !== 4) return false;
      if (!/[0-9,.]+/.test(row[2])) return false;
      if (row[3] !== 'Dr' && row[3] !== 'Cr') return false;
      return true;
    })
  return rows.map((row, index) => {
    return {
      id: index + 1,
      transactionAt: moment(row[0], 'DD-MM-YYYY').toDate(),
      title: row[1],
      summary: row[1],
      amount: (row[3] === 'Dr' ? -1 : 1) * parseFloatNumber(row[2].split(',').join('')),
    }
  })
}

const parseFloatNumber = (value: string): number => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? 0 : num;
}