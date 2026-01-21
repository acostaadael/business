// reports/strategies/pdf-report.strategy.ts
import { Injectable } from '@nestjs/common';
import { IReportGenerator } from '../interfaces/report-generator.interface';
import { ReportFormat, ReportType } from '../enums/report-type.enum';
import { ReportOptions, ReportData } from '../interfaces/report-data.interface';
import * as PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class PdfReportStrategy implements IReportGenerator {
  async generate(data: ReportData[], options: ReportOptions, format: ReportFormat): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        // Collect PDF data
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });

        // Add title
        doc.fontSize(20).text(options.title, { align: 'center' });
        doc.moveDown();

        // Add generation date
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown(2);

        // Add table headers
        if (options.columns && options.columns.length > 0) {
          const startX = 50;
          const startY = doc.y;
          const rowHeight = 20;
          const colWidths = options.columns.map(col => col.width || 100);

          // Draw table headers
          doc.font('Helvetica-Bold');
          let currentX = startX;

          options.columns.forEach((column, index) => {
            doc.text(column.header, currentX, startY, {
              width: colWidths[index],
              align: 'left',
            });
            currentX += colWidths[index];
          });

          // Draw horizontal line
          doc
            .moveTo(startX, startY + rowHeight)
            .lineTo(currentX, startY + rowHeight)
            .stroke();

          // Draw table data
          doc.font('Helvetica');
          let currentY = startY + rowHeight;

          data.forEach((row, rowIndex) => {
            currentX = startX;

            options.columns.forEach((column, colIndex) => {
              const cellData = row[column.key] || '';
              doc.text(String(cellData), currentX, currentY, {
                width: colWidths[colIndex],
                align: 'left',
              });
              currentX += colWidths[colIndex];
            });

            currentY += rowHeight;

            // Add page break if needed
            if (currentY > doc.page.height - 50 && rowIndex < data.length - 1) {
              doc.addPage();
              currentY = 50;
            }
          });
        }

        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(10).text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 30, { align: 'center' });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  getSupportedFormats(): ReportFormat[] {
    return [ReportFormat.PDF];
  }
}
