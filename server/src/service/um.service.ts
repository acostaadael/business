import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Um } from '../domain/um.entity';
import { UmDTO } from '../service/dto/um.dto';
import { UmMapper } from '../service/mapper/um.mapper';

@Injectable()
export class UmService {
  logger = new Logger('UmService');

  constructor(@InjectRepository(Um) private umRepository: Repository<Um>) {}

  async findById(id: number): Promise<UmDTO | undefined> {
    const result = await this.umRepository.findOne({
      where: { id },
    });
    return UmMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<UmDTO>): Promise<UmDTO | undefined> {
    const result = await this.umRepository.findOne(options);
    return UmMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<UmDTO>): Promise<[UmDTO[], number]> {
    const resultList = await this.umRepository.findAndCount(options);
    const umDTO: UmDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(um => umDTO.push(UmMapper.fromEntityToDTO(um)));
      resultList[0] = umDTO;
    }
    return resultList;
  }

  async save(umDTO: UmDTO, creator?: string): Promise<UmDTO | undefined> {
    const entity = UmMapper.fromDTOtoEntity(umDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.umRepository.save(entity);
    return UmMapper.fromEntityToDTO(result);
  }

  async update(umDTO: UmDTO, updater?: string): Promise<UmDTO | undefined> {
    const entity = UmMapper.fromDTOtoEntity(umDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.umRepository.save(entity);
    return UmMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.umRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
