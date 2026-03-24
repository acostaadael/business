import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Sale } from '../domain/sale.entity';
import { SaleProductShipment } from '../domain/sale-product-shipment.entity';

import { SaleController } from '../web/rest/sale.controller';
import { SaleService } from '../service/sale.service';

import { PeriodModule } from './period.module';
import { CompanyModule } from './company.module';
import { ProductShipmentModule } from './product-shipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleProductShipment]), PeriodModule, CompanyModule, ProductShipmentModule],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
