import { ConsoleLogger, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Entry } from '../domain/entry.entity';
import { EntryDTO } from '../service/dto/entry.dto';
import { EntryMapper } from '../service/mapper/entry.mapper';
import { PeriodService } from './period.service';
import { InventaryService } from './inventary.service';
import { InventaryDTO } from './dto/inventary.dto';

const relations = {
  area: true,
  period: true,
  product: { um: true },
} as const;

@Injectable()
export class EntryService {
  logger = new Logger('EntryService');

  constructor(
    @InjectRepository(Entry) private entryRepository: Repository<Entry>,
    private periodService: PeriodService,
    private inventaryService: InventaryService,
  ) {}

  async findById(id: number): Promise<EntryDTO | undefined> {
    const result = await this.entryRepository.findOne({
      relations,
      where: { id },
    });
    return EntryMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<EntryDTO>): Promise<EntryDTO | undefined> {
    const result = await this.entryRepository.findOne(options);
    return EntryMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<EntryDTO>): Promise<[EntryDTO[], number]> {
    const resultList = await this.entryRepository.findAndCount({ ...options, relations });
    const entryDTO: EntryDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(entry => entryDTO.push(EntryMapper.fromEntityToDTO(entry)));
      resultList[0] = entryDTO;
    }
    return resultList;
  }

  async save(entryDTO: EntryDTO, creator?: string): Promise<EntryDTO | undefined> {
    const openPeriod = await this.periodService.findOpen();

    if (openPeriod) {
      entryDTO.period = openPeriod;
      const entity = EntryMapper.fromDTOtoEntity(entryDTO);
      if (creator) {
        if (!entity.createdBy) {
          entity.createdBy = creator;
        }
        entity.lastModifiedBy = creator;
      }
      const result = await this.entryRepository.save(entity);

      await this.updateInventary(result);

      return EntryMapper.fromEntityToDTO(result);
    }
    throw new HttpException('No se puede crear entrada sin un periodo abierto!', HttpStatus.BAD_REQUEST);
  }

  async update(entryDTO: EntryDTO, updater?: string): Promise<EntryDTO | undefined> {
    const entity = EntryMapper.fromDTOtoEntity(entryDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.entryRepository.save(entity);
    return EntryMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.entryRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }

  async updateInventary(entry: Entry): Promise<InventaryDTO> {
    const exitsInventary = await this.inventaryService.findByFields({
      relations: { product: true, area: true },
      where: { product: { id: entry.product.id }, area: { id: entry.area.id } },
    });

    //Si existe inventario actualizar la cantidad
    if (exitsInventary) {
      console.log(exitsInventary);
      exitsInventary.count = Number(exitsInventary.count) + Number(entry.count);
      exitsInventary.lastModifiedBy = entry.lastModifiedBy;
      const result = await this.inventaryService.save(exitsInventary);
      return result;
    } else {
      //Sino crear un inventario nuevo
      let inventary = new InventaryDTO();
      inventary.product = entry.product;
      inventary.area = entry.area;
      inventary.count = entry.count;
      inventary.createdBy = entry.createdBy;
      inventary.lastModifiedBy = entry.lastModifiedBy;
      const result = await this.inventaryService.save(inventary);
      return result;
    }
  }
}
