import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitInventaryPeriod } from '../domain/init-inventary-period.entity';
import { InventaryModule } from './inventary.module';
import { CompanyModule } from './company.module';
import { PeriodModule } from './period.module';
import { InitInventaryPeriodService } from '../service/init-inventary-period.service';

@Module({
  imports: [TypeOrmModule.forFeature([InitInventaryPeriod]), InventaryModule, CompanyModule],
  controllers: [],
  providers: [InitInventaryPeriodService],
  exports: [InitInventaryPeriodService],
})
export class InitInventaryPeriodModule {}
