import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Company } from '../domain/company.entity';
import { CompanyDTO } from '../service/dto/company.dto';
import { CompanyMapper } from '../service/mapper/company.mapper';

@Injectable()
export class CompanyService {
  logger = new Logger('CompanyService');

  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

  async findById(id: number): Promise<CompanyDTO | undefined> {
    const result = await this.companyRepository.findOne({
      where: { id },
    });
    return CompanyMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<CompanyDTO>): Promise<CompanyDTO | undefined> {
    const result = await this.companyRepository.findOne(options);
    return CompanyMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<CompanyDTO>): Promise<[CompanyDTO[], number]> {
    const resultList = await this.companyRepository.findAndCount(options);
    const companyDTO: CompanyDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(company => companyDTO.push(CompanyMapper.fromEntityToDTO(company)));
      resultList[0] = companyDTO;
    }
    return resultList;
  }

  async save(companyDTO: CompanyDTO, creator?: string): Promise<CompanyDTO | undefined> {
    const entity = CompanyMapper.fromDTOtoEntity(companyDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.companyRepository.save(entity);
    return CompanyMapper.fromEntityToDTO(result);
  }

  async update(companyDTO: CompanyDTO, updater?: string): Promise<CompanyDTO | undefined> {
    const entity = CompanyMapper.fromDTOtoEntity(companyDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.companyRepository.save(entity);
    return CompanyMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.companyRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
