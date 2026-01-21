// reports/reports.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsController } from './controllers/reports.controller';
import { ReportService } from './services/report.service';
import { StorageService } from './services/storage.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { ReportRepository } from './repositories/report.repository';
import { PdfReportStrategy } from './strategies/pdf-report.strategy';
import { ExcelReportStrategy } from './strategies/excel-report.strategy';
import { Report } from './entities/report.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), ScheduleModule.forRoot()],
  controllers: [ReportsController],
  providers: [
    ReportService,
    ReportGeneratorService,
    ReportRepository,
    PdfReportStrategy,
    ExcelReportStrategy,
    StorageService,
    ConfigService,
  ],
  exports: [ReportService, ReportGeneratorService, StorageService, ConfigService],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly reportService: ReportService) {}

  async onModuleInit() {
    // Cleanup expired reports on module initialization
    await this.reportService.cleanupExpiredReports();
  }
}
