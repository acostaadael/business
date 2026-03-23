import { Brackets, Repository } from 'typeorm';
import { Entry } from '../domain/entry.entity';
import { EntryQueryDTO } from '../service/dto/entry.query.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EntryRepository extends Repository<Entry> {
  constructor(
    @InjectRepository(Entry)
    private readonly repository: Repository<Entry>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAllFilter(query: EntryQueryDTO): Promise<[Entry[], number]> {
    const q = this.createQueryBuilder('entry')
      .innerJoinAndSelect('entry.period', 'period')
      .innerJoinAndSelect('entry.product', 'product')
      .innerJoinAndSelect('entry.company', 'company')
      .innerJoinAndSelect('product.um', 'um')
      .innerJoinAndSelect('entry.area', 'area')
      .where('period.id = :periodId', { periodId: query.periodId })
      .andWhere('company.id = :companyId', { companyId: query.companyId });

    if (query.globalFilter) {
      q.andWhere(
        new Brackets(qb => {
          qb.where('product.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('um.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('area.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('entry.day::TEXT ilike :t', { t: `%${query.globalFilter}%` });
        }),
      );
    }

    q.skip(+query.pageRequest.page * query.pageRequest.size);
    q.take(+query.pageRequest.size);

    let sortProperty = query.pageRequest.sort.property;
    if (query.pageRequest.sort.property === 'id') {
      sortProperty = 'entry.id';
    }
    if (query.pageRequest.sort.property === 'day') {
      sortProperty = 'entry.day';
    }
    const directionSort = query.pageRequest.sort.direction === 'asc' ? 'ASC' : 'DESC';

    q.addOrderBy(sortProperty, directionSort);

    return await q.getManyAndCount();
  }

  /**
   * Costo total de compras del periodo (SUM(entry.count * product.cost_price)).
   */
  async sumCostAmountByPeriodCompany(params: { companyId: number; periodId: number }): Promise<number> {
    const { companyId, periodId } = params;

    const raw = await this.createQueryBuilder('entry')
      .select('COALESCE(SUM(entry.count * product.cost_price), 0)', 'sum')
      .innerJoin('entry.product', 'product')
      .innerJoin('entry.company', 'company')
      .innerJoin('entry.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .getRawOne<{ sum: string | number }>();

    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }

  async sumCostAmountByPeriodCompanyFiltered(params: {
    companyId: number;
    periodId: number;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<number> {
    const { companyId, periodId, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('entry')
      .select('COALESCE(SUM(entry.count * product.cost_price), 0)', 'sum')
      .innerJoin('entry.product', 'product')
      .innerJoin('entry.company', 'company')
      .innerJoin('entry.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId });

    if (productLineId || productFamilyId || productCategoryId) {
      qb.innerJoin('product.productLine', 'productLine');
    }
    if (productFamilyId || productCategoryId) {
      qb.innerJoin('productLine.productFamily', 'productFamily');
    }
    if (productCategoryId) {
      qb.innerJoin('productFamily.productCategory', 'productCategory');
    }

    if (productLineId) qb.andWhere('productLine.id = :productLineId', { productLineId });
    if (productFamilyId) qb.andWhere('productFamily.id = :productFamilyId', { productFamilyId });
    if (productCategoryId) qb.andWhere('productCategory.id = :productCategoryId', { productCategoryId });

    const raw = await qb.getRawOne<{ sum: string | number }>();
    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }
}
