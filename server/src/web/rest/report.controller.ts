import { ClassSerializerInterceptor, Controller, Get, Logger, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageRequest } from '../../domain/base/pagination.entity';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { InventaryService } from '../../service/inventary.service';
import { CompanyService } from '../../service/company.service';
import { InventaryDTO } from '../../service/dto/inventary.dto';
import { InventaryQueryDTO } from '../../service/dto/inventary.query.dto';

@Controller('api/reports')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('reports')
export class ReportController {
  logger = new Logger('ReportController');

  constructor(
    private readonly inventaryService: InventaryService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('/inventaries')
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: InventaryDTO,
  })
  async getAll(): Promise<InventaryDTO[]> {
    const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const inventaryQuery = new InventaryQueryDTO();
    inventaryQuery.pageRequest = pageRequest;
    inventaryQuery.companyId = currentCompany.id;
    inventaryQuery.globalFilter = null;

    const [results, count] = await this.inventaryService.findAndCount(inventaryQuery);
    return results;
  }
}
