// reports/interfaces/report-generator.interface.ts
import { ReportType, ReportFormat } from '../enums/report-type.enum';
import { ReportOptions, ReportData } from './report-data.interface';

export interface IReportGenerator {
  generate(data: ReportData[], options: ReportOptions, format: ReportFormat): Promise<Buffer>;

  getSupportedFormats(): ReportFormat[];
}
