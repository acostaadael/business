import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { InventaryService } from '../service/inventary.service';
import { CompanyService } from '../service/company.service';
import { InjectRepository } from '@nestjs/typeorm';
import { InitInventaryPeriod } from '../domain/init-inventary-period.entity';
import { PageRequest } from '../domain/base/pagination.entity';
import { InventaryQueryDTO } from './dto/inventary.query.dto';
import { Period } from '../domain/period.entity';

const relations = {
  area: true,
  period: true,
  company: true,
  product: { um: true },
} as const;

@Injectable()
export class InitInventaryPeriodService {
  logger = new Logger('InitInventaryPeriodService');

  constructor(
    @InjectRepository(InitInventaryPeriod) private initInventaryPeriodRepository: Repository<InitInventaryPeriod>,
    private companyService: CompanyService,
    private inventaryService: InventaryService,
  ) {}

  async findByFields(options: FindOneOptions<InitInventaryPeriod>): Promise<InitInventaryPeriod | undefined> {
    return await this.initInventaryPeriodRepository.findOne(options);
  }

  async save(period: Period): Promise<InitInventaryPeriod | undefined | void> {
    const currentCompany = await this.companyService.findActive();

    if (currentCompany) {
      //Obtener inventarios existentes de la company actual
      const pageRequest: PageRequest = new PageRequest(0, Number.MAX_SAFE_INTEGER, 'id,ASC');
      const inventaryQuery = new InventaryQueryDTO();
      inventaryQuery.pageRequest = pageRequest;
      inventaryQuery.companyId = currentCompany.id;
      inventaryQuery.globalFilter = null;

      const [results, count] = await this.inventaryService.findAndCount(inventaryQuery);

      for (const inventary of results) {
        const initInventary = new InitInventaryPeriod();
        initInventary.period = period;
        initInventary.company = currentCompany;
        initInventary.createdBy = 'admin';
        initInventary.product = inventary.product;
        initInventary.count = inventary.count;
        initInventary.area = inventary.area;

        await this.initInventaryPeriodRepository.save(initInventary);
      }
      return;
    }
    throw new HttpException('No se puede crear entrada sin una company activa!', HttpStatus.BAD_REQUEST);
  }
}
