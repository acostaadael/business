import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ProductFamily } from '../domain/product-family.entity';
import { ProductFamilyDTO } from '../service/dto/product-family.dto';
import { ProductFamilyMapper } from '../service/mapper/product-family.mapper';

const relations = {
  productCategory: true,
  productLines: true,
} as const;

@Injectable()
export class ProductFamilyService {
  logger = new Logger('ProductFamilyService');

  constructor(@InjectRepository(ProductFamily) private productFamilyRepository: Repository<ProductFamily>) {}

  async findById(id: number): Promise<ProductFamilyDTO | undefined> {
    const result = await this.productFamilyRepository.findOne({
      relations,
      where: { id },
    });
    return ProductFamilyMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ProductFamilyDTO>): Promise<ProductFamilyDTO | undefined> {
    const result = await this.productFamilyRepository.findOne(options);
    return ProductFamilyMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<ProductFamilyDTO>): Promise<[ProductFamilyDTO[], number]> {
    const resultList = await this.productFamilyRepository.findAndCount({ ...options, relations });
    const productFamilyDTO: ProductFamilyDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(productFamily => productFamilyDTO.push(ProductFamilyMapper.fromEntityToDTO(productFamily)));
      resultList[0] = productFamilyDTO;
    }
    return resultList;
  }

  async save(productFamilyDTO: ProductFamilyDTO, creator?: string): Promise<ProductFamilyDTO | undefined> {
    const entity = ProductFamilyMapper.fromDTOtoEntity(productFamilyDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.productFamilyRepository.save(entity);
    return ProductFamilyMapper.fromEntityToDTO(result);
  }

  async update(productFamilyDTO: ProductFamilyDTO, updater?: string): Promise<ProductFamilyDTO | undefined> {
    const entity = ProductFamilyMapper.fromDTOtoEntity(productFamilyDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.productFamilyRepository.save(entity);
    return ProductFamilyMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    const entityFind = await this.findById(id);
    if (entityFind.productLines.length > 0) {
      throw new HttpException('No se puede eliminar, está asociada a lineas de productos!', HttpStatus.BAD_REQUEST);
    }

    await this.productFamilyRepository.delete(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
