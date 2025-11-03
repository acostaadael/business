import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ProductCategory } from '../domain/product-category.entity';
import { ProductCategoryDTO } from '../service/dto/product-category.dto';
import { ProductCategoryMapper } from '../service/mapper/product-category.mapper';

@Injectable()
export class ProductCategoryService {
  logger = new Logger('ProductCategoryService');

  constructor(@InjectRepository(ProductCategory) private productCategoryRepository: Repository<ProductCategory>) {}

  async findById(id: number): Promise<ProductCategoryDTO | undefined> {
    const result = await this.productCategoryRepository.findOne({
      where: { id },
      relations: ['productFamilies'],
    });
    return ProductCategoryMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ProductCategoryDTO>): Promise<ProductCategoryDTO | undefined> {
    const result = await this.productCategoryRepository.findOne(options);
    return ProductCategoryMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<ProductCategoryDTO>): Promise<[ProductCategoryDTO[], number]> {
    const resultList = await this.productCategoryRepository.findAndCount(options);
    const productCategoryDTO: ProductCategoryDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(productCategory => productCategoryDTO.push(ProductCategoryMapper.fromEntityToDTO(productCategory)));
      resultList[0] = productCategoryDTO;
    }
    return resultList;
  }

  async save(productCategoryDTO: ProductCategoryDTO, creator?: string): Promise<ProductCategoryDTO | undefined> {
    const entity = ProductCategoryMapper.fromDTOtoEntity(productCategoryDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.productCategoryRepository.save(entity);
    return ProductCategoryMapper.fromEntityToDTO(result);
  }

  async update(productCategoryDTO: ProductCategoryDTO, updater?: string): Promise<ProductCategoryDTO | undefined> {
    const entity = ProductCategoryMapper.fromDTOtoEntity(productCategoryDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.productCategoryRepository.save(entity);
    return ProductCategoryMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    const entityFind = await this.findById(id);
    if (entityFind.productFamilies.length > 0) {
      throw new HttpException('No se puede eliminar, está asociada a familias de productos!', HttpStatus.BAD_REQUEST);
    }

    await this.productCategoryRepository.delete(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
