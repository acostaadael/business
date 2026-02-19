import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from '../web/rest/report.controller';
import { InventaryModule } from './inventary.module';
import { CompanyModule } from './company.module';
import { EntryModule } from './entry.module';
import { PeriodModule } from './period.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), InventaryModule, CompanyModule, EntryModule, PeriodModule],
  controllers: [ReportController],
})
export class ReportModule {}
