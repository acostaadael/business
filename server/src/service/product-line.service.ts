import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ProductLine } from '../domain/product-line.entity';
import { ProductLineDTO } from '../service/dto/product-line.dto';
import { ProductLineMapper } from '../service/mapper/product-line.mapper';

const relations = {
  productFamily: true,
} as const;

@Injectable()
export class ProductLineService {
  logger = new Logger('ProductLineService');

  constructor(@InjectRepository(ProductLine) private productLineRepository: Repository<ProductLine>) {}

  async findById(id: number): Promise<ProductLineDTO | undefined> {
    const result = await this.productLineRepository.findOne({
      relations,
      where: { id },
    });
    return ProductLineMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ProductLineDTO>): Promise<ProductLineDTO | undefined> {
    const result = await this.productLineRepository.findOne(options);
    return ProductLineMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<ProductLineDTO>): Promise<[ProductLineDTO[], number]> {
    const resultList = await this.productLineRepository.findAndCount({ ...options, relations });
    const productLineDTO: ProductLineDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(productLine => productLineDTO.push(ProductLineMapper.fromEntityToDTO(productLine)));
      resultList[0] = productLineDTO;
    }
    return resultList;
  }

  async save(productLineDTO: ProductLineDTO, creator?: string): Promise<ProductLineDTO | undefined> {
    const entity = ProductLineMapper.fromDTOtoEntity(productLineDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.productLineRepository.save(entity);
    return ProductLineMapper.fromEntityToDTO(result);
  }

  async update(productLineDTO: ProductLineDTO, updater?: string): Promise<ProductLineDTO | undefined> {
    const entity = ProductLineMapper.fromDTOtoEntity(productLineDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.productLineRepository.save(entity);
    return ProductLineMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.productLineRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
