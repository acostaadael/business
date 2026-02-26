import { ClassSerializerInterceptor, Controller, Get, Res, Logger, UseInterceptors, Param } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageRequest } from '../../domain/base/pagination.entity';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { InventaryService } from '../../service/inventary.service';
import { CompanyService } from '../../service/company.service';
import { InventaryQueryDTO } from '../../service/dto/inventary.query.dto';
import { EntryService } from '../../service/entry.service';
import { EntryQueryDTO } from '../../service/dto/entry.query.dto';
import { PeriodService } from '../../service/period.service';
import { InventaryDTO } from '../../service/dto/inventary.dto';
import { EntryDTO } from '../../service/dto/entry.dto';

@Controller('api/reports')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('reports')
export class ReportController {
  logger = new Logger('ReportController');

  constructor(
    private readonly inventaryService: InventaryService,
    private readonly companyService: CompanyService,
    private readonly entryService: EntryService,
    private readonly periodService: PeriodService,
  ) {}

  @Get('/inventaries')
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: InventaryDTO,
  })
  async getInventaries(@Res() res: Response): Promise<InventaryDTO[]> {
    const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const inventaryQuery = new InventaryQueryDTO();
    inventaryQuery.pageRequest = pageRequest;
    inventaryQuery.companyId = currentCompany.id;
    inventaryQuery.globalFilter = null;

    const [results, count] = await this.inventaryService.findAndCount(inventaryQuery);
    return results;
  }

  @Get('/entries/:periodId')
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: EntryDTO,
  })
  async getEntries(@Param('periodId') periodId: number): Promise<EntryDTO[]> {
    const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const entryQuery = new EntryQueryDTO();
    entryQuery.periodId = periodId;
    entryQuery.pageRequest = pageRequest;
    entryQuery.companyId = currentCompany.id;
    entryQuery.globalFilter = null;

    const [results, count] = await this.entryService.findAndCount(entryQuery);
    return results;
  }
}
