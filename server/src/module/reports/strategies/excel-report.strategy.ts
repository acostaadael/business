// reports/strategies/excel-report.strategy.ts
import { Injectable } from '@nestjs/common';
import { IReportGenerator } from '../interfaces/report-generator.interface';
import { ReportFormat } from '../enums/report-type.enum';
import { ReportOptions, ReportData } from '../interfaces/report-data.interface';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelReportStrategy implements IReportGenerator {
  async generate(data: ReportData[], options: ReportOptions, format: ReportFormat): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 20;

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = options.title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add headers
    const headers = options.columns.map(col => col.header);
    const headerRow = worksheet.addRow(headers);

    // Style headers
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    data.forEach(item => {
      const rowData = options.columns.map(col => item[col.key] || '');
      const row = worksheet.addRow(rowData);

      // Style data rows
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Generate buffer
    let buffer: Buffer;
    if (format === ReportFormat.EXCEL_XLSX) {
      buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
    } else if (format === ReportFormat.EXCEL_XLS) {
      buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
    }

    return buffer;
  }

  getSupportedFormats(): ReportFormat[] {
    return [ReportFormat.EXCEL_XLSX, ReportFormat.EXCEL_XLS];
  }
}
