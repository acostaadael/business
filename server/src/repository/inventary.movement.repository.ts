import { Brackets, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryMovement } from '../domain/inventory-movement.entity';
import { InventoryMovementQueryDTO } from '../service/dto/inventory-movement.query.dto';

@Injectable()
export class InventoryMovementRepository extends Repository<InventoryMovement> {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly repository: Repository<InventoryMovement>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAllFilter(query: InventoryMovementQueryDTO): Promise<[InventoryMovement[], number]> {
    const q = this.createQueryBuilder('inventory_movement')
      .innerJoinAndSelect('inventory_movement.product', 'product')
      .innerJoinAndSelect('inventory_movement.company', 'company')
      .innerJoinAndSelect('inventory_movement.period', 'period')
      .innerJoinAndSelect('inventory_movement.source', 'source')
      .innerJoinAndSelect('inventory_movement.target', 'target')
      .innerJoinAndSelect('product.um', 'um')
      .where('company.id = :companyId', { companyId: query.companyId })
      .andWhere('period.id = :periodId', { periodId: query.periodId });

    if (query.globalFilter) {
      q.andWhere(
        new Brackets(qb => {
          qb.where('product.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('um.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('source.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('target.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('inventory_movement.day::TEXT ilike :t', { t: `%${query.globalFilter}%` });
        }),
      );
    }

    q.skip(+query.pageRequest.page * query.pageRequest.size);
    q.take(+query.pageRequest.size);

    let sortProperty = query.pageRequest.sort.property;
    if (query.pageRequest.sort.property === 'id') {
      sortProperty = 'inventory_movement.id';
    }
    const directionSort = query.pageRequest.sort.direction === 'asc' ? 'ASC' : 'DESC';

    q.addOrderBy(sortProperty, directionSort);

    return await q.getManyAndCount();
  }
}
