import { config } from '@vue/test-utils';
// reports/services/report.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportRepository } from '../repositories/report.repository';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { ReportStatus } from '../enums/report-status.enum';
import { ReportGeneratorService } from './report-generator.service';
import { ReportOptions, ReportData } from '../interfaces/report-data.interface';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly reportRetentionDays: number;

  constructor(
    @InjectRepository(ReportRepository)
    private readonly reportRepository: ReportRepository,
    private readonly reportGenerator: ReportGeneratorService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    this.reportRetentionDays = this.configService.get<number>('REPORT_RETENTION_DAYS', 30);
  }

  async findAll(filterDto: ReportFilterDto): Promise<{ data: Report[]; total: number }> {
    const [data, total] = await this.reportRepository.findWithFilters(filterDto);
    return { data, total };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportRepository.create({
      ...createReportDto,
      generatedBy: userId,
      expiresAt: createReportDto.expiresAt ? new Date(createReportDto.expiresAt) : this.getDefaultExpirationDate(),
    });

    return await this.reportRepository.save(report);
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);

    Object.assign(report, updateReportDto);

    return await this.reportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);

    // Delete file from storage if exists
    if (report.fileUrl) {
      await this.storageService.deleteFile(report.fileName);
    }

    await this.reportRepository.remove(report);
  }

  async generateReport(reportId: string, data: ReportData[], options: ReportOptions, userId: string): Promise<Report> {
    const report = await this.findOne(reportId);

    // Update report status
    report.status = ReportStatus.PROCESSING;
    report.generatedBy = userId;
    await this.reportRepository.save(report);

    try {
      // Generate report file
      const fileBuffer = await this.reportGenerator.generateReport(data, options, report.format);

      // Save file to storage
      const fileName = `reports/${reportId}-${Date.now()}.${report.format}`;
      const fileUrl = await this.storageService.uploadFile(fileName, fileBuffer, 'application/octet-stream');

      // Update report with file information
      report.status = ReportStatus.COMPLETED;
      report.fileUrl = fileUrl;
      report.fileName = fileName;
      report.fileSize = fileBuffer.length / 1024; // Size in KB
      report.completedAt = new Date();

      return await this.reportRepository.save(report);
    } catch (error) {
      this.logger.error(`Failed to generate report ${reportId}:`, error);

      // Update report with error
      report.status = ReportStatus.FAILED;
      report.errorMessage = error.message;
      await this.reportRepository.save(report);

      throw new BadRequestException(`Failed to generate report: ${error.message}`);
    }
  }

  async downloadReport(id: string): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
    const report = await this.findOne(id);

    if (!report.canDownload()) {
      throw new BadRequestException('Report is not available for download');
    }

    // Get file from storage
    const fileBuffer = await this.storageService.getFile(report.fileName);

    const contentType = this.getContentType(report.format);
    const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${report.format}`;

    return { buffer: fileBuffer, fileName, contentType };
  }

  async cleanupExpiredReports(): Promise<number> {
    const expiredReports = await this.reportRepository.findExpiredReports();
    let deletedCount = 0;

    for (const report of expiredReports) {
      try {
        // Delete file from storage
        if (report.fileUrl) {
          await this.storageService.deleteFile(report.fileName);
        }

        // Update report status or delete
        report.status = ReportStatus.EXPIRED;
        await this.reportRepository.save(report);

        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to cleanup report ${report.id}:`, error);
      }
    }

    return deletedCount;
  }

  private getDefaultExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + this.reportRetentionDays);
    return date;
  }

  private getContentType(format: string): string {
    const contentTypes = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      json: 'application/json',
      html: 'text/html',
    };

    return contentTypes[format] || 'application/octet-stream';
  }

  async getReportStatistics(): Promise<{
    total: number;
    byStatus: Record<ReportStatus, number>;
    byType: Record<string, number>;
    storageUsed: number;
  }> {
    const [total, byStatus, byType, storageUsed] = await Promise.all([
      this.reportRepository.count(),
      this.getReportsByStatus(),
      this.getReportsByType(),
      this.getTotalStorageUsed(),
    ]);

    return { total, byStatus, byType, storageUsed };
  }

  private async getReportsByStatus(): Promise<Record<ReportStatus, number>> {
    const result = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status, COUNT(*) as count')
      .groupBy('report.status')
      .getRawMany();

    const byStatus = {} as Record<ReportStatus, number>;
    result.forEach(({ status, count }) => {
      byStatus[status] = parseInt(count, 10);
    });

    return byStatus;
  }

  private async getReportsByType(): Promise<Record<string, number>> {
    const result = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.type, COUNT(*) as count')
      .groupBy('report.type')
      .getRawMany();

    const byType = {} as Record<string, number>;
    result.forEach(({ type, count }) => {
      byType[type] = parseInt(count, 10);
    });

    return byType;
  }

  private async getTotalStorageUsed(): Promise<number> {
    const result = await this.reportRepository
      .createQueryBuilder('report')
      .select('SUM(report.fileSize)', 'total')
      .where('report.fileSize IS NOT NULL')
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
