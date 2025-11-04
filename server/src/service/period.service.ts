import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Period } from '../domain/period.entity';
import { PeriodDTO } from '../service/dto/period.dto';
import { PeriodMapper } from '../service/mapper/period.mapper';
import { PeriodStatus } from '../domain/enumeration/period-status';

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

  async findLastClosed(): Promise<PeriodDTO | undefined> {
    const result = await this.periodRepository.findOne({
      where: { status: PeriodStatus.CLOSE },
      order: { id: 'DESC' },
    });
    return PeriodMapper.fromEntityToDTO(result);
  }

  async findOpen(): Promise<PeriodDTO | undefined> {
    const result = await this.periodRepository.findOne({
      where: { status: PeriodStatus.OPEN },
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
    await this.validate(periodDTO);

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

  async validate(periodDTO: PeriodDTO): Promise<void | undefined> {
    //Chequeo si existe algun periodo Abierto
    const openPeriod = await this.periodRepository.findOne({
      where: { status: PeriodStatus.OPEN },
    });
    if (openPeriod) {
      throw new HttpException('Ya existe un periodo abierto!', HttpStatus.BAD_REQUEST);
    }

    //Chequeo si existe algun periodo con el mes y año que quiero crear
    const existsPeriod = await this.periodRepository.findOne({
      where: { month: periodDTO.month, year: periodDTO.year },
    });
    if (existsPeriod) {
      throw new HttpException(`Ya existe un periodo del mes: ${periodDTO.month}, año: ${periodDTO.year} !`, HttpStatus.BAD_REQUEST);
    }

    //Obtener ultimo periodo cerrado
    const lastPeriod = await this.findLastClosed();
    if (lastPeriod && lastPeriod.year == periodDTO.year) {
      if (periodDTO.month < lastPeriod.month || periodDTO.month - 1 !== lastPeriod.month)
        throw new HttpException(`No se puede crear un periodo con mes: ${periodDTO.month} !`, HttpStatus.BAD_REQUEST);
    }

    const date = new Date();
    const month = date.getMonth() + 1;
    if (periodDTO.month !== month) {
      throw new HttpException(`No se puede crear un periodo con mes: ${periodDTO.month} !`, HttpStatus.BAD_REQUEST);
    }
  }
}
