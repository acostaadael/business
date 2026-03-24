import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sale } from '../domain/sale.entity';
import { SaleType } from '../domain/enumeration/sale-type';

@Injectable()
export class SaleRepository extends Repository<Sale> {
  constructor(
    @InjectRepository(Sale)
    private readonly repository: Repository<Sale>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async sumSalesAmountFiltered(params: {
    companyId: number;
    periodId: number;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<number> {
    const { companyId, periodId, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('sale')
      .select('COALESCE(SUM(productShipment.count * product.selling_price), 0)', 'sum')
      .innerJoin('sale.company', 'company')
      .innerJoin('sale.period', 'period')
      .innerJoin('sale.productShipments', 'sps')
      .innerJoin('sps.productShipment', 'productShipment')
      .innerJoin('productShipment.product', 'product')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId });

    if (productLineId || productFamilyId || productCategoryId) {
      qb.innerJoin('product.productLine', 'productLine');
    }

    if (productCategoryId) {
      qb.innerJoin('productLine.productFamily', 'productFamily');
      qb.innerJoin('productFamily.productCategory', 'productCategory');
      qb.andWhere('productCategory.id = :productCategoryId', { productCategoryId });
    }

    if (productFamilyId) {
      qb.innerJoin('productLine.productFamily', 'productFamily2');
      qb.andWhere('productFamily2.id = :productFamilyId', { productFamilyId });
    }

    if (productLineId) {
      qb.andWhere('productLine.id = :productLineId', { productLineId });
    }

    const raw = await qb.getRawOne<{ sum: string | number }>();
    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }

  async sumSalesAmountByTypeFiltered(params: {
    companyId: number;
    periodId: number;
    type: SaleType;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<number> {
    const { companyId, periodId, type, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('sale')
      .select('COALESCE(SUM(productShipment.count * product.selling_price), 0)', 'sum')
      .innerJoin('sale.company', 'company')
      .innerJoin('sale.period', 'period')
      .innerJoin('sale.productShipments', 'sps')
      .innerJoin('sps.productShipment', 'productShipment')
      .innerJoin('productShipment.product', 'product')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .andWhere('sale.type = :type', { type });

    if (productLineId || productFamilyId || productCategoryId) {
      qb.innerJoin('product.productLine', 'productLine');
    }

    if (productCategoryId) {
      qb.innerJoin('productLine.productFamily', 'productFamily');
      qb.innerJoin('productFamily.productCategory', 'productCategory');
      qb.andWhere('productCategory.id = :productCategoryId', { productCategoryId });
    }

    if (productFamilyId) {
      qb.innerJoin('productLine.productFamily', 'productFamily2');
      qb.andWhere('productFamily2.id = :productFamilyId', { productFamilyId });
    }

    if (productLineId) {
      qb.andWhere('productLine.id = :productLineId', { productLineId });
    }

    const raw = await qb.getRawOne<{ sum: string | number }>();
    const val = raw?.sum;
    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
    return Number.isFinite(num) ? num : 0;
  }

  async sumSalesByDayFiltered(params: {
    companyId: number;
    periodId: number;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<Array<{ day: number; amount: number; total: number }>> {
    const { companyId, periodId, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('sale')
      .select('sale.day', 'day')
      .addSelect('COALESCE(SUM(productShipment.count * product.selling_price), 0)', 'amount')
      .addSelect('COALESCE(SUM(productShipment.count), 0)', 'total')
      .innerJoin('sale.company', 'company')
      .innerJoin('sale.period', 'period')
      .innerJoin('sale.productShipments', 'sps')
      .innerJoin('sps.productShipment', 'productShipment')
      .innerJoin('productShipment.product', 'product')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .groupBy('sale.day')
      .orderBy('sale.day', 'ASC');

    if (productLineId || productFamilyId || productCategoryId) {
      qb.innerJoin('product.productLine', 'productLine');
    }

    if (productCategoryId) {
      qb.innerJoin('productLine.productFamily', 'productFamily');
      qb.innerJoin('productFamily.productCategory', 'productCategory');
      qb.andWhere('productCategory.id = :productCategoryId', { productCategoryId });
    }

    if (productFamilyId) {
      qb.innerJoin('productLine.productFamily', 'productFamily2');
      qb.andWhere('productFamily2.id = :productFamilyId', { productFamilyId });
    }

    if (productLineId) {
      qb.andWhere('productLine.id = :productLineId', { productLineId });
    }

    const rows = await qb.getRawMany<{ day: string; amount: string; total: string }>();
    return (rows ?? []).map(r => ({
      day: Number(r.day),
      amount: parseFloat(String(r.amount ?? 0)) || 0,
      total: parseFloat(String(r.total ?? 0)) || 0,
    }));
  }

  async topProductsByAmountFiltered(params: {
    companyId: number;
    periodId: number;
    limit: number;
    productCategoryId?: number;
    productFamilyId?: number;
    productLineId?: number;
  }): Promise<Array<{ productId: number; productName: string; umName: string; total: number; amount: number }>> {
    const { companyId, periodId, limit, productCategoryId, productFamilyId, productLineId } = params;

    const qb = this.createQueryBuilder('sale')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('um.name', 'umName')
      .addSelect('COALESCE(SUM(productShipment.count), 0)', 'total')
      .addSelect('COALESCE(SUM(productShipment.count * product.selling_price), 0)', 'amount')
      .innerJoin('sale.company', 'company')
      .innerJoin('sale.period', 'period')
      .innerJoin('sale.productShipments', 'sps')
      .innerJoin('sps.productShipment', 'productShipment')
      .innerJoin('productShipment.product', 'product')
      .leftJoin('product.um', 'um')
      .where('company.id = :companyId', { companyId })
      .andWhere('period.id = :periodId', { periodId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('um.name')
      .orderBy('amount', 'DESC')
      .limit(limit);

    if (productLineId || productFamilyId || productCategoryId) {
      qb.innerJoin('product.productLine', 'productLine');
    }

    if (productCategoryId) {
      qb.innerJoin('productLine.productFamily', 'productFamily');
      qb.innerJoin('productFamily.productCategory', 'productCategory');
      qb.andWhere('productCategory.id = :productCategoryId', { productCategoryId });
    }

    if (productFamilyId) {
      qb.innerJoin('productLine.productFamily', 'productFamily2');
      qb.andWhere('productFamily2.id = :productFamilyId', { productFamilyId });
    }

    if (productLineId) {
      qb.andWhere('productLine.id = :productLineId', { productLineId });
    }

    const rows = await qb.getRawMany<{ productId: string; productName: string; umName: string; total: string; amount: string }>();
    return (rows ?? []).map(r => ({
      productId: Number(r.productId),
      productName: r.productName,
      umName: r.umName,
      total: parseFloat(String(r.total ?? 0)) || 0,
      amount: parseFloat(String(r.amount ?? 0)) || 0,
    }));
  }
}
