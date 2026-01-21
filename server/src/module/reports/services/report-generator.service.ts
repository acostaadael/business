// reports/services/report-generator.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportFormat } from '../enums/report-type.enum';
import { IReportGenerator } from '../interfaces/report-generator.interface';
import { PdfReportStrategy } from '../strategies/pdf-report.strategy';
import { ExcelReportStrategy } from '../strategies/excel-report.strategy';
import { ReportOptions, ReportData } from '../interfaces/report-data.interface';

@Injectable()
export class ReportGeneratorService {
  private generators: Map<ReportFormat, IReportGenerator>;

  constructor(
    private readonly pdfGenerator: PdfReportStrategy,
    private readonly excelGenerator: ExcelReportStrategy,
  ) {
    this.generators = new Map();
    this.registerGenerators();
  }

  private registerGenerators(): void {
    // Register all supported formats for each generator
    this.pdfGenerator.getSupportedFormats().forEach(format => {
      this.generators.set(format, this.pdfGenerator);
    });

    this.excelGenerator.getSupportedFormats().forEach(format => {
      this.generators.set(format, this.excelGenerator);
    });
  }

  async generateReport(data: ReportData[], options: ReportOptions, format: ReportFormat): Promise<Buffer> {
    const generator = this.generators.get(format);

    if (!generator) {
      throw new NotFoundException(`No generator found for format: ${format}`);
    }

    return generator.generate(data, options, format);
  }

  getSupportedFormats(): ReportFormat[] {
    return Array.from(this.generators.keys());
  }
}
