import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductShipment } from '../domain/product-shipment.entity';
import { ProductShipmentController } from '../web/rest/product-shipment.controller';
import { ProductShipmentService } from '../service/product-shipment.service';
import { CompanyModule } from './company.module';
import { PeriodModule } from './period.module';
import { InventaryModule } from './inventary.module';
import { ProductShipmentRepository } from '../repository/inventary.shipment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductShipment, ProductShipmentRepository]), CompanyModule, PeriodModule, InventaryModule],
  controllers: [ProductShipmentController],
  providers: [ProductShipmentService, ProductShipmentRepository],
  exports: [ProductShipmentService, ProductShipmentRepository],
})
export class ProductShipmentModule {}
