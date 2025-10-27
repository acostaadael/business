import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Area } from '../domain/area.entity';
import { AreaDTO } from '../service/dto/area.dto';
import { AreaMapper } from '../service/mapper/area.mapper';

@Injectable()
export class AreaService {
  logger = new Logger('AreaService');

  constructor(@InjectRepository(Area) private areaRepository: Repository<Area>) {}

  async findById(id: number): Promise<AreaDTO | undefined> {
    const result = await this.areaRepository.findOne({
      where: { id },
    });
    return AreaMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<AreaDTO>): Promise<AreaDTO | undefined> {
    const result = await this.areaRepository.findOne(options);
    return AreaMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<AreaDTO>): Promise<[AreaDTO[], number]> {
    const resultList = await this.areaRepository.findAndCount(options);
    const areaDTO: AreaDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(area => areaDTO.push(AreaMapper.fromEntityToDTO(area)));
      resultList[0] = areaDTO;
    }
    return resultList;
  }

  async save(areaDTO: AreaDTO, creator?: string): Promise<AreaDTO | undefined> {
    const entity = AreaMapper.fromDTOtoEntity(areaDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.areaRepository.save(entity);
    return AreaMapper.fromEntityToDTO(result);
  }

  async update(areaDTO: AreaDTO, updater?: string): Promise<AreaDTO | undefined> {
    const entity = AreaMapper.fromDTOtoEntity(areaDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.areaRepository.save(entity);
    return AreaMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.areaRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
