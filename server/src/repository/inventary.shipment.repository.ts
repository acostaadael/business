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
}
