import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '../domain/product-category.entity';
import { ProductFamily } from '../domain/product-family.entity';
import { ProductLine } from '../domain/product-line.entity';
import { ProductHierarchyController } from '../web/rest/product-hierarchy.controller';
import { ProductHierarchyService } from '../service/product-hierarchy.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory, ProductFamily, ProductLine])],
  controllers: [ProductHierarchyController],
  providers: [ProductHierarchyService],
  exports: [ProductHierarchyService],
})
export class ProductHierarchyModule {}
