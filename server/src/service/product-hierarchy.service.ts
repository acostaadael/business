import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../domain/product-category.entity';
import { ProductFamily } from '../domain/product-family.entity';
import { ProductLine } from '../domain/product-line.entity';
import { IdNameDTO } from './dto/id-name.dto';

@Injectable()
export class ProductHierarchyService {
  constructor(
    @InjectRepository(ProductCategory) private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductFamily) private readonly familyRepo: Repository<ProductFamily>,
    @InjectRepository(ProductLine) private readonly lineRepo: Repository<ProductLine>,
  ) {}

  async listCategories(): Promise<IdNameDTO[]> {
    const rows = await this.categoryRepo.find({ select: { id: true, name: true }, order: { name: 'ASC' } });
    return (rows ?? []).map(r => ({ id: r.id, name: r.name }));
  }

  async listFamilies(params: { productCategoryId?: number }): Promise<IdNameDTO[]> {
    const { productCategoryId } = params;
    const rows = await this.familyRepo.find({
      select: { id: true, name: true },
      where: productCategoryId ? { productCategory: { id: productCategoryId } } : {},
      order: { name: 'ASC' },
      relations: productCategoryId ? [] : [],
    });
    return (rows ?? []).map(r => ({ id: r.id, name: r.name }));
  }

  async listLines(params: { productFamilyId?: number }): Promise<IdNameDTO[]> {
    const { productFamilyId } = params;
    const rows = await this.lineRepo.find({
      select: { id: true, name: true },
      where: productFamilyId ? { productFamily: { id: productFamilyId } } : {},
      order: { name: 'ASC' },
      relations: productFamilyId ? [] : [],
    });
    return (rows ?? []).map(r => ({ id: r.id, name: r.name }));
  }
}
