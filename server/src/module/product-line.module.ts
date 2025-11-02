import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLine } from '../domain/product-line.entity';
import { ProductLineController } from '../web/rest/product-line.controller';
import { ProductLineService } from '../service/product-line.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductLine])],
  controllers: [ProductLineController],
  providers: [ProductLineService],
  exports: [ProductLineService],
})
export class ProductLineModule {}
