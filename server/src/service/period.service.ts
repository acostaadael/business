import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Period } from '../domain/period.entity';
import { PeriodDTO } from '../service/dto/period.dto';
import { PeriodMapper } from '../service/mapper/period.mapper';

@Injectable()
export class PeriodService {
  logger = new Logger('PeriodService');

  constructor(@InjectRepository(Period) private periodRepository: Repository<Period>) {}

  async findById(id: number): Promise<PeriodDTO | undefined> {
    const result = await this.periodRepository.findOne({
      where: { id },
    });
    return PeriodMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<PeriodDTO>): Promise<PeriodDTO | undefined> {
    const result = await this.periodRepository.findOne(options);
    return PeriodMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<PeriodDTO>): Promise<[PeriodDTO[], number]> {
    const resultList = await this.periodRepository.findAndCount(options);
    const periodDTO: PeriodDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(period => periodDTO.push(PeriodMapper.fromEntityToDTO(period)));
      resultList[0] = periodDTO;
    }
    return resultList;
  }

  async save(periodDTO: PeriodDTO, creator?: string): Promise<PeriodDTO | undefined> {
    const entity = PeriodMapper.fromDTOtoEntity(periodDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.periodRepository.save(entity);
    return PeriodMapper.fromEntityToDTO(result);
  }

  async update(periodDTO: PeriodDTO, updater?: string): Promise<PeriodDTO | undefined> {
    const entity = PeriodMapper.fromDTOtoEntity(periodDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.periodRepository.save(entity);
    return PeriodMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.periodRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
