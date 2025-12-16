import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Inventary } from '../domain/inventary.entity';
import { InventaryDTO } from '../service/dto/inventary.dto';
import { InventaryMapper } from '../service/mapper/inventary.mapper';

const relations = {
  product: true,
} as const;

@Injectable()
export class InventaryService {
  logger = new Logger('InventaryService');

  constructor(@InjectRepository(Inventary) private inventaryRepository: Repository<Inventary>) {}

  async findById(id: number): Promise<InventaryDTO | undefined> {
    const result = await this.inventaryRepository.findOne({
      relations,
      where: { id },
    });
    return InventaryMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<InventaryDTO>): Promise<InventaryDTO | undefined> {
    const result = await this.inventaryRepository.findOne(options);
    return InventaryMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<InventaryDTO>): Promise<[InventaryDTO[], number]> {
    const resultList = await this.inventaryRepository.findAndCount({ ...options, relations });
    const inventaryDTO: InventaryDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(inventary => inventaryDTO.push(InventaryMapper.fromEntityToDTO(inventary)));
      resultList[0] = inventaryDTO;
    }
    return resultList;
  }

  async save(inventaryDTO: InventaryDTO, creator?: string): Promise<InventaryDTO | undefined> {
    const entity = InventaryMapper.fromDTOtoEntity(inventaryDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.inventaryRepository.save(entity);
    return InventaryMapper.fromEntityToDTO(result);
  }

  async update(inventaryDTO: InventaryDTO, updater?: string): Promise<InventaryDTO | undefined> {
    const entity = InventaryMapper.fromDTOtoEntity(inventaryDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.inventaryRepository.save(entity);
    return InventaryMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.inventaryRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
