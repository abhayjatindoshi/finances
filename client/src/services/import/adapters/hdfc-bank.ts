import moment from "moment";
import { BankMedium, ImportAdapter, ImportedData, ImportedTransaction, ImportFormat } from "../import-adapter";
import { convertToBuffer, ExcelWorkbook, parseMoney, readExcelFile } from "../import-utils";

class HdfcBank implements ImportAdapter {
  name = 'HDFC Bank';
  supportedFileTypes = [ImportFormat.Excel];
  private readonly dateRegex = /^[\d]{2}\/[\d]{2}\/[\d]{2}$/;

  async isCompatibleFile(file: File): Promise<boolean> {
    const excelSheets = await this.parseFile(file);
    return excelSheets
      .filter(rows => rows.length > 0)
      .filter(rows => rows[0].length > 0)
      .filter(rows => rows[0][0].toUpperCase().indexOf('HDFC') !== -1)
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
            transactionAt: moment(row[0], 'DD/MM/YY').toDate(),
            title: row[1],
            summary: row[1],
            amount: parseMoney(row[5]) - parseMoney(row[4])
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

export default HdfcBank;