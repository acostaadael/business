import { Brackets, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventary } from '../domain/inventary.entity';
import { InventaryQueryDTO } from 'src/service/dto/inventary.query.dto';

@Injectable()
export class InventaryRepository extends Repository<Inventary> {
  constructor(
    @InjectRepository(Inventary)
    private readonly repository: Repository<Inventary>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAllFilter(query: InventaryQueryDTO): Promise<[Inventary[], number]> {
    const q = this.createQueryBuilder('inventary')
      .innerJoinAndSelect('inventary.product', 'product')
      .innerJoinAndSelect('inventary.company', 'company')
      .innerJoinAndSelect('product.um', 'um')
      .innerJoinAndSelect('inventary.area', 'area')
      .where('company.id = :companyId', { companyId: query.companyId });

    if (query.globalFilter) {
      q.andWhere(
        new Brackets(qb => {
          qb.where('product.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('um.name ilike :t', { t: `%${query.globalFilter}%` })
            .orWhere('area.name ilike :t', { t: `%${query.globalFilter}%` });
        }),
      );
    }

    q.skip(+query.pageRequest.page * query.pageRequest.size);
    q.take(+query.pageRequest.size);

    let sortProperty = query.pageRequest.sort.property;
    if (query.pageRequest.sort.property === 'id') {
      sortProperty = 'inventary.id';
    }
    const directionSort = query.pageRequest.sort.direction === 'asc' ? 'ASC' : 'DESC';

    q.addOrderBy(sortProperty, directionSort);

    return await q.getManyAndCount();
  }
}
