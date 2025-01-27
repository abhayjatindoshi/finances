import moment from "moment";
import { BankMedium, ImportAdapter, ImportedData, ImportFormat } from "../import-adapter";
import { convertToBuffer, parseMoney, readPdfFile } from "../import-utils";

class FederalBank implements ImportAdapter {
  name = 'Federal Bank';
  supportedFileTypes = [ImportFormat.PDF];
  private readonly dateRegex = /^[\d]{2}\/[\d]{2}\/[\d]{4}$/;

  async isCompatibleFile(file: File): Promise<boolean> {
    const pdf = await this.parseFile(file);
    return pdf.some(page =>
      page.split(/[\s]/)
        .some(text => text.toUpperCase().indexOf('FEDERAL') !== -1));
  }

  private async parseFile(file: File): Promise<string[]> {
    const buffer = await convertToBuffer(file);
    return readPdfFile(buffer);
  }

  async import(file: File): Promise<ImportedData> {
    const pdf = await this.parseFile(file);
    const rows = pdf.join(' ').replaceAll(/(Cr|Dr)/g, '$1\n')
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

    const transactions = rows.map((row, index) => ({
      id: index + 1,
      transactionAt: moment(row[0], 'DD-MM-YYYY').toDate(),
      title: row[1],
      summary: row[1],
      amount: (row[3] === 'Dr' ? -1 : 1) * parseMoney(row[2])
    }));

    return {
      bankMedium: BankMedium.CreditCard,
      importFormat: ImportFormat.PDF,
      transactions
    }
  }
}

export default FederalBank;