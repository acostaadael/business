import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Res,
  Logger,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PageRequest } from '../../domain/base/pagination.entity';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { InventaryService } from '../../service/inventary.service';
import { CompanyService } from '../../service/company.service';
import { InventaryQueryDTO } from '../../service/dto/inventary.query.dto';
import jsreport from 'jsreport-client';
import { EntryService } from '../../service/entry.service';
import { EntryQueryDTO } from '../../service/dto/entry.query.dto';
import { PeriodService } from '../../service/period.service';

@Controller('api/reports')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('reports')
export class ReportController {
  logger = new Logger('ReportController');
  private readonly jsreportClient;

  constructor(
    private readonly inventaryService: InventaryService,
    private readonly companyService: CompanyService,
    private readonly entryService: EntryService,
    private readonly periodService: PeriodService,
  ) {
    this.jsreportClient = jsreport('http://localhost:5488', {
      username: 'admin',
      password: 'password',
    });
  }

  @Get('/inventaries')
  async getInventaries(@Res() res: Response) {
    const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const inventaryQuery = new InventaryQueryDTO();
    inventaryQuery.pageRequest = pageRequest;
    inventaryQuery.companyId = currentCompany.id;
    inventaryQuery.globalFilter = null;

    const [results, count] = await this.inventaryService.findAndCount(inventaryQuery);

    try {
      // Call jsreport render API
      const reportStream = await this.jsreportClient.render({
        template: {
          name: 'inventarios-main', // Template name in jsreport
        },
        data: {
          items: results, // Pass dynamic data to template
        },
      });

      const pdfBuffer = await this.streamToBuffer(reportStream);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="inventarios.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      // Send the PDF buffer
      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (err) {
      console.error('Error generating report:', err);
      throw new HttpException('Failed to generate report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/entries/:periodId')
  async getEntries(@Param('periodId') periodId: number, @Res() res: Response) {
    const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const entryQuery = new EntryQueryDTO();
    entryQuery.periodId = periodId;
    entryQuery.pageRequest = pageRequest;
    entryQuery.companyId = currentCompany.id;
    entryQuery.globalFilter = null;

    const [results, count] = await this.entryService.findAndCount(entryQuery);

    const period = await this.periodService.findById(periodId);

    try {
      // Call jsreport render API
      const reportStream = await this.jsreportClient.render({
        template: {
          name: 'entradas-main', // Template name in jsreport
        },
        data: {
          items: results,
          period: `Mes: ${period.month}; Año: ${period.year}`, // Pass dynamic data to template
        },
      });

      const pdfBuffer = await this.streamToBuffer(reportStream);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="entradas.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      // Send the PDF buffer
      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (err) {
      console.error('Error generating report:', err);
      throw new HttpException('Failed to generate report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', err => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
