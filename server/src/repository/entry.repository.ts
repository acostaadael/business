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
      .innerJoinAndSelect('product.um', 'um')
      .innerJoinAndSelect('entry.area', 'area')
      .where('period.id = :periodId', { periodId: query.periodId });

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
      sortProperty = 'entry.id';
    }
    if (query.pageRequest.sort.property === 'day') {
      sortProperty = 'entry.day';
    }
    const directionSort = query.pageRequest.sort.direction === 'asc' ? 'ASC' : 'DESC';

    q.addOrderBy(sortProperty, directionSort);

    return await q.getManyAndCount();
  }
}
