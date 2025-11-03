import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Product } from '../domain/product.entity';
import { ProductDTO } from '../service/dto/product.dto';
import { ProductMapper } from '../service/mapper/product.mapper';

const relations = {
  um: true,
  productLine: true,
} as const;

@Injectable()
export class ProductService {
  logger = new Logger('ProductService');

  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}

  async findById(id: number): Promise<ProductDTO | undefined> {
    const result = await this.productRepository.findOne({
      relations,
      where: { id },
    });
    return ProductMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ProductDTO>): Promise<ProductDTO | undefined> {
    const result = await this.productRepository.findOne(options);
    return ProductMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<ProductDTO>): Promise<[ProductDTO[], number]> {
    const resultList = await this.productRepository.findAndCount({ ...options, relations });
    const productDTO: ProductDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(product => productDTO.push(ProductMapper.fromEntityToDTO(product)));
      resultList[0] = productDTO;
    }
    return resultList;
  }

  async save(productDTO: ProductDTO, creator?: string): Promise<ProductDTO | undefined> {
    const entity = ProductMapper.fromDTOtoEntity(productDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.productRepository.save(entity);
    return ProductMapper.fromEntityToDTO(result);
  }

  async update(productDTO: ProductDTO, updater?: string): Promise<ProductDTO | undefined> {
    const entity = ProductMapper.fromDTOtoEntity(productDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.productRepository.save(entity);
    return ProductMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.productRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }
}
