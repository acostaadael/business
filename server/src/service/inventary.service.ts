import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { InventaryDTO } from '../service/dto/inventary.dto';
import { InventaryMapper } from '../service/mapper/inventary.mapper';
import { InventaryRepository } from '../repository/inventary.repository';
import { InventaryQueryDTO } from '../service/dto/inventary.query.dto';
import { EntryDTO } from '../service/dto/entry.dto';
import { InventoryMovementDTO } from './dto/inventory-movement.dto';

const relations = {
  product: true,
  area: true,
} as const;

@Injectable()
export class InventaryService {
  logger = new Logger('InventaryService');

  constructor(private readonly inventaryRepository: InventaryRepository) {}

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

  async findAndCount(query: InventaryQueryDTO): Promise<[InventaryDTO[], number]> {
    const resultList = await this.inventaryRepository.findAllFilter(query);
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

  async createOrUpdateInventaryFromEntry(entry: EntryDTO): Promise<InventaryDTO> {
    const exitsInventary = await this.findByFields({
      relations: { product: true, area: true, company: true },
      where: {
        product: { id: entry.product.id },
        area: { id: entry.area.id },
        company: { id: entry.company.id },
      },
    });

    //Si existe inventario actualizar la cantidad
    if (exitsInventary) {
      exitsInventary.count = Number(exitsInventary.count) + Number(entry.count);
      const result = await this.update(exitsInventary, entry.lastModifiedBy);
      return result;
    } else {
      //Sino crear un inventario nuevo
      const inventary = new InventaryDTO();
      inventary.product = entry.product;
      inventary.area = entry.area;
      inventary.count = entry.count;
      inventary.company = entry.company;
      const result = await this.save(inventary, entry.createdBy);
      return result;
    }
  }

  async moveInventaries(movement: InventoryMovementDTO): Promise<InventaryDTO> {
    const exitsInventary = await this.findByFields({
      relations: { product: true, area: true, company: true },
      where: {
        product: { id: movement.product.id },
        area: { id: movement.source.id },
        company: { id: movement.company.id },
      },
    });
    const movementCount = Number(movement.count);
    const inventoryCount = Number(exitsInventary.count);

    if (exitsInventary && movementCount <= inventoryCount) {
      const restCount = inventoryCount - movementCount;

      if (restCount == 0) {
        await this.deleteById(exitsInventary.id);
      } else {
        exitsInventary.count = restCount;
        await this.update(exitsInventary, movement.lastModifiedBy);
      }

      const entry = new EntryDTO();
      entry.product = movement.product;
      entry.area = movement.target;
      entry.company = movement.company;
      entry.count = movementCount;
      entry.createdBy = movement.createdBy;
      const inventary = await this.createOrUpdateInventaryFromEntry(entry);
      return inventary;
    }
    throw new HttpException('No existe esta cantidad en inventario!', HttpStatus.BAD_REQUEST);
  }
}
