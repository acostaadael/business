import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from '../domain/inventory-movement.entity';
import { InventoryMovementController } from '../web/rest/inventory-movement.controller';
import { InventoryMovementService } from '../service/inventory-movement.service';
import { CompanyModule } from './company.module';
import { PeriodModule } from './period.module';
import { InventaryModule } from './inventary.module';
import { InventoryMovementRepository } from '../repository/inventary.movement.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, InventoryMovementRepository]), CompanyModule, PeriodModule, InventaryModule],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService, InventoryMovementRepository],
  exports: [InventoryMovementService, InventoryMovementRepository],
})
export class InventoryMovementModule {}
