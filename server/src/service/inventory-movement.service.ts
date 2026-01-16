import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InventoryMovement } from '../domain/inventory-movement.entity';
import { InventoryMovementDTO } from '../service/dto/inventory-movement.dto';
import { InventoryMovementMapper } from '../service/mapper/inventory-movement.mapper';
import { PeriodService } from './period.service';
import { CompanyService } from './company.service';

const relations = {
  period: true,
  company: true,
  product: true,
  source: true,
  target: true,
} as const;

@Injectable()
export class InventoryMovementService {
  logger = new Logger('InventoryMovementService');

  constructor(
    @InjectRepository(InventoryMovement) private inventoryMovementRepository: Repository<InventoryMovement>,
    private periodService: PeriodService,
    private companyService: CompanyService,
  ) {}

  async findById(id: number): Promise<InventoryMovementDTO | undefined> {
    const result = await this.inventoryMovementRepository.findOne({
      relations,
      where: { id },
    });
    return InventoryMovementMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<InventoryMovementDTO>): Promise<InventoryMovementDTO | undefined> {
    const result = await this.inventoryMovementRepository.findOne(options);
    return InventoryMovementMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<InventoryMovementDTO>): Promise<[InventoryMovementDTO[], number]> {
    const resultList = await this.inventoryMovementRepository.findAndCount({ ...options, relations });
    const inventoryMovementDTO: InventoryMovementDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(inventoryMovement => inventoryMovementDTO.push(InventoryMovementMapper.fromEntityToDTO(inventoryMovement)));
      resultList[0] = inventoryMovementDTO;
    }
    return resultList;
  }

  async save(inventoryMovementDTO: InventoryMovementDTO, creator?: string): Promise<InventoryMovementDTO | undefined> {
    const entity = InventoryMovementMapper.fromDTOtoEntity(inventoryMovementDTO);
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (openPeriod && currentCompany) {
      inventoryMovementDTO.company = currentCompany;
      inventoryMovementDTO.period = openPeriod;

      if (creator) {
        if (!entity.createdBy) {
          entity.createdBy = creator;
        }
        entity.lastModifiedBy = creator;
      }
      const result = await this.inventoryMovementRepository.save(entity);

      return InventoryMovementMapper.fromEntityToDTO(result);
    }
    throw new HttpException('No se puede crear movimiento sin un periodo abierto!', HttpStatus.BAD_REQUEST);
  }

  async update(inventoryMovementDTO: InventoryMovementDTO, updater?: string): Promise<InventoryMovementDTO | undefined> {
    const entity = InventoryMovementMapper.fromDTOtoEntity(inventoryMovementDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.inventoryMovementRepository.save(entity);
    return InventoryMovementMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.inventoryMovementRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
