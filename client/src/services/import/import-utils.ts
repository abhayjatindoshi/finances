import * as xlsx from "xlsx";
import { pdfjs } from "react-pdf";

export const convertToBuffer = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export type ExcelWorkbook = Array<Array<Array<string>>>;

export const readExcelFile = (file: ArrayBuffer): ExcelWorkbook => {
  const workbook = xlsx.read(file);
  const sheets = new Array<string[][]>();
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet["!ref"]) continue;
    const range = xlsx.utils.decode_range(sheet["!ref"]);
    const rows = new Array<string[]>();
    for (let rowIndex = 0; rowIndex <= range.e.r; rowIndex++) {
      const row = new Array<string>();
      for (let colIndex = 0; colIndex <= range.e.c; colIndex++) {
        const cellIndex = xlsx.utils.encode_cell({ c: colIndex, r: rowIndex });
        row.push(sheet[cellIndex]?.v ?? "");
      }
      rows.push(row);
    }
    sheets.push(rows);
  }
  return sheets;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export const readPdfFile = async (file: ArrayBuffer): Promise<string[]> => {
  const pdf = await pdfjs.getDocument({ data: file }).promise
  const pages = new Array<string>();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .filter(item => 'str' in item)
      .map(item => item as { str: string })
      .map(item => item.str).join(' ');
    pages.push(text);
  }
  return pages;
}

export const parseMoney = (text: string): number => {
  text = text + '';
  let num = parseFloat(text.replace(',', ''));
  num = isNaN(num) ? 0 : num;
  return parseFloat(num.toFixed(2));
}