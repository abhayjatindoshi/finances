import FederalBank from "./adapters/federal-bank";
import HdfcBank from "./adapters/hdfc-bank";
import JupiterBank from "./adapters/jupiter-bank";
import { ImportAdapter, ImportedData, ImportFormat } from "./import-adapter";

export interface CompatibleBank {
  name: string,
  import: () => Promise<ImportedData>
}

class ImportService {
  private adapters: Array<ImportAdapter> = [
    new HdfcBank(),
    new JupiterBank(),
    new FederalBank(),
  ];

  async findCompatibleBanks(file: File): Promise<Array<CompatibleBank>> {
    const fileType = this.detectFileType(file);
    let filteredAdapters = this.adapters.filter(a =>
      typeof a.supportedFileTypes === 'function' ?
        a.supportedFileTypes(fileType) : a.supportedFileTypes.includes(fileType));
    filteredAdapters = await this.asyncAdapterFilter(filteredAdapters, async adapter => await adapter.isCompatibleFile(file));
    return filteredAdapters.map(adapter => ({
      name: adapter.name,
      import: async () => await adapter.import(file)
    }));
  }

  private async asyncAdapterFilter(array: Array<ImportAdapter>, predicate: (item: ImportAdapter) => Promise<boolean>): Promise<Array<ImportAdapter>> {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_, index) => results[index]);
  }

  private detectFileType(file: File): ImportFormat {
    if (file.type === 'application/pdf') {
      return ImportFormat.PDF;
    } else if (file.type.indexOf('sheet') !== -1 || file.type.indexOf('excel') !== -1) {
      return ImportFormat.Excel;
    } else {
      return ImportFormat.Unknown;
    }
  }
}

const importService = new ImportService();
export default importService;
