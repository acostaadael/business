import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from '../domain/inventory-movement.entity';
import { InventoryMovementController } from '../web/rest/inventory-movement.controller';
import { InventoryMovementService } from '../service/inventory-movement.service';
import { CompanyModule } from './company.module';
import { PeriodModule } from './period.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement]), CompanyModule, PeriodModule],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService],
  exports: [InventoryMovementService],
})
export class InventoryMovementModule {}
