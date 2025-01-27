import { BankMedium, ImportAdapter, ImportedData, ImportedTransaction, ImportFormat } from "../import-adapter";
import { ExcelWorkbook, convertToBuffer, parseMoney, readExcelFile } from "../import-utils";
import moment from "moment";

class JupiterBank implements ImportAdapter {
  name = 'Jupiter Bank';
  supportedFileTypes = [ImportFormat.Excel];
  private readonly dateRegex = /^[\d]{2}\/[\d]{2}\/[\d]{4}$/;

  async isCompatibleFile(file: File): Promise<boolean> {
    const excelSheets = await this.parseFile(file);
    return excelSheets
      .filter(rows => rows.length > 0)
      .filter(rows => rows[0].filter(cell => cell.toUpperCase().indexOf('JUPITER') !== -1).length > 0)
      .length > 0;
  }

  private async parseFile(file: File): Promise<ExcelWorkbook> {
    const buffer = await convertToBuffer(file);
    return readExcelFile(buffer);
  }

  async import(file: File): Promise<ImportedData> {
    const excelSheets = await this.parseFile(file);
    const transactions = new Array<ImportedTransaction>();
    excelSheets.forEach(rows => {
      rows.filter(row => this.dateRegex.test(row[0]))
        .forEach((row, index) => {
          transactions.push({
            id: index + 1,
            transactionAt: moment(row[0], 'DD/MM/YYYY').toDate(),
            title: row[2],
            summary: row[2],
            amount: parseMoney(row[6]) - parseMoney(row[5])
          });
        });
    });

    return {
      bankMedium: BankMedium.SavingsAccount,
      importFormat: ImportFormat.Excel,
      transactions
    }
  }
}

export default JupiterBank;