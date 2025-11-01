import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFamily } from '../domain/product-family.entity';
import { ProductFamilyController } from '../web/rest/product-family.controller';
import { ProductFamilyService } from '../service/product-family.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFamily])],
  controllers: [ProductFamilyController],
  providers: [ProductFamilyService],
  exports: [ProductFamilyService],
})
export class ProductFamilyModule {}
