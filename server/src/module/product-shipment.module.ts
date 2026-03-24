import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductShipment } from '../domain/product-shipment.entity';
import { Sale } from '../domain/sale.entity';
import { ProductShipmentController } from '../web/rest/product-shipment.controller';
import { ProductShipmentService } from '../service/product-shipment.service';
import { CompanyModule } from './company.module';
import { PeriodModule } from './period.module';
import { InventaryModule } from './inventary.module';
import { ProductShipmentRepository } from '../repository/inventary.shipment.repository';
import { SaleRepository } from '../repository/sale.repository';
import { EntryModule } from './entry.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductShipment, Sale, ProductShipmentRepository, SaleRepository]),
    CompanyModule,
    PeriodModule,
    InventaryModule,
    EntryModule,
  ],
  controllers: [ProductShipmentController],
  providers: [ProductShipmentService, ProductShipmentRepository, SaleRepository],
  exports: [ProductShipmentService, ProductShipmentRepository, SaleRepository],
})
export class ProductShipmentModule {}
