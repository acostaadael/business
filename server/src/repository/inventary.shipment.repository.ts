import { Brackets, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryMovementQueryDTO } from '../service/dto/inventory-movement.query.dto';
import { ProductShipment } from '../domain/product-shipment.entity';

@Injectable()
export class ProductShipmentRepository extends Repository<ProductShipment> {
  constructor(
    @InjectRepository(ProductShipment)
    private readonly repository: Repository<ProductShipment>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAllFilter(query: InventoryMovementQueryDTO): Promise<[ProductShipment[], number]> {
    const q = this.createQueryBuilder('product_shipment')
      .innerJoinAndSelect('product_shipment.product', 'product')
      .innerJoinAndSelect('product_shipment.company', 'company')
      .innerJoinAndSelect('product_shipment.period', 'period')
      .innerJoinAndSelect('product_shipment.area', 'area')
      .innerJoinAndSelect('product.um', 'um')
      .where('company.id = :companyId', { companyId: query.companyId })
      .andWhere('period.id = :periodId', { periodId: query.periodId });

    if (query.globalFilter) {
      q.andWhere(
        new Brackets(qb => {
          qb.where('product.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('um.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('area.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('product_shipment.day::TEXT ilike :t', { t: `%${query.globalFilter}%` });
        }),
      );
    }

    if (query.exitType) {
      q.andWhere('product_shipment.type = :exitType', { exitType: query.exitType });
    }

    q.skip(+query.pageRequest.page * query.pageRequest.size);
    q.take(+query.pageRequest.size);

    let sortProperty = query.pageRequest.sort.property;
    if (query.pageRequest.sort.property === 'id') {
      sortProperty = 'product_shipment.id';
    }
    if (query.pageRequest.sort.property === 'type') {
      sortProperty = 'product_shipment.type';
    }
    const directionSort = query.pageRequest.sort.direction === 'asc' ? 'ASC' : 'DESC';

    q.addOrderBy(sortProperty, directionSort);

    return await q.getManyAndCount();
  }

  /**
   * Total vendido (suma de count) para un tipo (por defecto VENTA)
   */
  async sumCountByPeriodCompanyType(params: { companyId: number; periodId: number; type: string }): Promise<number> {
    const { companyId, periodId, type } = params;

    const raw = await this.createQueryBuilder('product_shipment')
      .select('COALESCE(SUM(product_shipment.count), 0)', 'sum')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .getRawOne<{ sum: string | number }>();

    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }

  /**
   * Total vendido en dinero (SUM(count * product.selling_price)) para un tipo.
   */
  async sumAmountByPeriodCompanyType(params: { companyId: number; periodId: number; type: string }): Promise<number> {
    const { companyId, periodId, type } = params;

    const raw = await this.createQueryBuilder('product_shipment')
      .select('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'sum')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .getRawOne<{ sum: string | number }>();

    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }

  async sumAmountByPeriodCompanyTypeFiltered(params: {
    companyId: number;
    periodId: number;
    type: string;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<number> {
    const { companyId, periodId, type, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('product_shipment')
      .select('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'sum')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type });

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

  /**
   * Ventas por día (day 1..31) para un tipo.
   */
  async sumCountByDay(params: { companyId: number; periodId: number; type: string }): Promise<Array<{ day: number; total: number }>> {
    const { companyId, periodId, type } = params;

    const rows = await this.createQueryBuilder('product_shipment')
      .select('product_shipment.day', 'day')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .groupBy('product_shipment.day')
      .orderBy('product_shipment.day', 'ASC')
      .getRawMany<{ day: string | number; total: string | number }>();

    return (rows ?? []).map(r => ({
      day: typeof r.day === 'number' ? r.day : parseInt(String(r.day), 10),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
    }));
  }

  /**
   * Ventas por día con importe (day 1..31) para un tipo.
   */
  async sumCountAndAmountByDay(params: {
    companyId: number;
    periodId: number;
    type: string;
  }): Promise<Array<{ day: number; total: number; amount: number }>> {
    const { companyId, periodId, type } = params;

    const rows = await this.createQueryBuilder('product_shipment')
      .select('product_shipment.day', 'day')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .addSelect('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'amount')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .groupBy('product_shipment.day')
      .orderBy('product_shipment.day', 'ASC')
      .getRawMany<{ day: string | number; total: string | number; amount: string | number }>();

    return (rows ?? []).map(r => ({
      day: typeof r.day === 'number' ? r.day : parseInt(String(r.day), 10),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
      amount: typeof r.amount === 'number' ? r.amount : parseFloat(String(r.amount ?? 0)),
    }));
  }

  async sumCountAndAmountByDayFiltered(params: {
    companyId: number;
    periodId: number;
    type: string;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<Array<{ day: number; total: number; amount: number }>> {
    const { companyId, periodId, type, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('product_shipment')
      .select('product_shipment.day', 'day')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .addSelect('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'amount')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type });

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

    const rows = await qb.groupBy('product_shipment.day').orderBy('product_shipment.day', 'ASC').getRawMany<{
      day: string | number;
      total: string | number;
      amount: string | number;
    }>();

    return (rows ?? []).map(r => ({
      day: typeof r.day === 'number' ? r.day : parseInt(String(r.day), 10),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
      amount: typeof r.amount === 'number' ? r.amount : parseFloat(String(r.amount ?? 0)),
    }));
  }

  /**
   * Top productos por cantidad vendida.
   */
  async topProductsByCount(params: {
    companyId: number;
    periodId: number;
    type: string;
    limit?: number;
  }): Promise<Array<{ productId: number; productName: string; total: number }>> {
    const { companyId, periodId, type, limit = 5 } = params;

    const rows = await this.createQueryBuilder('product_shipment')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string | number; productName: string; total: string | number }>();

    return (rows ?? []).map(r => ({
      productId: typeof r.productId === 'number' ? r.productId : parseInt(String(r.productId), 10),
      productName: String(r.productName ?? ''),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
    }));
  }

  /**
   * Top productos por cantidad e importe vendido (amount = SUM(count * selling_price)).
   */
  async topProductsByCountAndAmount(params: {
    companyId: number;
    periodId: number;
    type: string;
    limit?: number;
  }): Promise<Array<{ productId: number; productName: string; total: number; amount: number; umName: string }>> {
    const { companyId, periodId, type, limit = 5 } = params;

    const rows = await this.createQueryBuilder('product_shipment')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('um.name', 'umName')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .addSelect('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'amount')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product.um', 'um')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('um.name')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string | number; productName: string; umName: string; total: string | number; amount: string | number }>();

    return (rows ?? []).map(r => ({
      productId: typeof r.productId === 'number' ? r.productId : parseInt(String(r.productId), 10),
      productName: String(r.productName ?? ''),
      umName: String(r.umName ?? ''),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
      amount: typeof r.amount === 'number' ? r.amount : parseFloat(String(r.amount ?? 0)),
    }));
  }

  async topProductsByCountAndAmountFiltered(params: {
    companyId: number;
    periodId: number;
    type: string;
    limit?: number;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<Array<{ productId: number; productName: string; total: number; amount: number; umName: string }>> {
    const { companyId, periodId, type, limit = 5, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('product_shipment')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('um.name', 'umName')
      .addSelect('COALESCE(SUM(product_shipment.count), 0)', 'total')
      .addSelect('COALESCE(SUM(product_shipment.count * product.selling_price), 0)', 'amount')
      .innerJoin('product_shipment.product', 'product')
      .innerJoin('product.um', 'um')
      .innerJoin('product_shipment.company', 'company')
      .innerJoin('product_shipment.period', 'period')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('product_shipment.type = :type', { type });

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

    const rows = await qb
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('um.name')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string | number; productName: string; umName: string; total: string | number; amount: string | number }>();

    return (rows ?? []).map(r => ({
      productId: typeof r.productId === 'number' ? r.productId : parseInt(String(r.productId), 10),
      productName: String(r.productName ?? ''),
      umName: String(r.umName ?? ''),
      total: typeof r.total === 'number' ? r.total : parseFloat(String(r.total ?? 0)),
      amount: typeof r.amount === 'number' ? r.amount : parseFloat(String(r.amount ?? 0)),
    }));
  }
}
