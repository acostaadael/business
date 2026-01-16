import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { Entry } from '../domain/entry.entity';
import { EntryDTO } from '../service/dto/entry.dto';
import { EntryMapper } from '../service/mapper/entry.mapper';
import { PeriodService } from './period.service';
import { InventaryService } from './inventary.service';
import { InventaryDTO } from './dto/inventary.dto';
import { EntryRepository } from '../repository/entry.repository';
import { EntryQueryDTO } from './dto/entry.query.dto';
import { CompanyService } from './company.service';

const relations = {
  area: true,
  period: true,
  company: true,
  product: { um: true },
} as const;

@Injectable()
export class EntryService {
  logger = new Logger('EntryService');

  constructor(
    private readonly entryRepository: EntryRepository,
    private periodService: PeriodService,
    private companyService: CompanyService,
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

  async findAndCount(query: EntryQueryDTO): Promise<[EntryDTO[], number]> {
    const resultList = await this.entryRepository.findAllFilter(query);
    const entryDTO: EntryDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(entry => entryDTO.push(EntryMapper.fromEntityToDTO(entry)));
      resultList[0] = entryDTO;
    }
    return resultList;
  }

  async save(entryDTO: EntryDTO, creator?: string): Promise<EntryDTO | undefined> {
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (openPeriod && currentCompany) {
      entryDTO.period = openPeriod;
      entryDTO.company = currentCompany;
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
      relations: { product: true, area: true, company: true },
      where: {
        product: { id: entry.product.id },
        area: { id: entry.area.id },
        company: { id: entry.company.id },
      },
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
      inventary.company = entry.company;
      inventary.createdBy = entry.createdBy;
      inventary.lastModifiedBy = entry.lastModifiedBy;
      const result = await this.inventaryService.save(inventary);
      return result;
    }
  }
}
