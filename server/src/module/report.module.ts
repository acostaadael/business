import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from '../web/rest/report.controller';
import { InventaryModule } from './inventary.module';
import { CompanyModule } from './company.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), InventaryModule, CompanyModule],
  controllers: [ReportController],
})
export class ReportModule {}
