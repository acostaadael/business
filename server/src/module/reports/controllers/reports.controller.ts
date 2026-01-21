// reports/controllers/reports.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res, HttpStatus, StreamableFile, Header } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { Report } from '../entities/report.entity';
import { AuthGuard } from '../../../security/guards/auth.guard';
import { RolesGuard } from '../../../security/guards/roles.guard';
import { Roles } from '../../../security/decorators/roles.decorator';
import { AuthUser } from '../../../security/decorators/auth-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoleType } from '../../../security';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports with filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'expired'] })
  @ApiQuery({ name: 'type', required: false, enum: ['pdf', 'excel', 'csv', 'json', 'html'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of reports' })
  async findAll(@Query() filterDto: ReportFilterDto) {
    return await this.reportService.findAll(filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get report statistics' })
  @ApiResponse({ status: 200, description: 'Report statistics' })
  async getStatistics() {
    return await this.reportService.getReportStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id') id: string): Promise<Report> {
    return await this.reportService.findOne(id);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async create(@Body() createReportDto: CreateReportDto, @AuthUser() user: any): Promise<Report> {
    return await this.reportService.create(createReportDto, user.id);
  }

  @Put(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto): Promise<Report> {
    return await this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reportService.remove(id);
  }

  @Post(':id/generate')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Generate report with data' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async generate(@Param('id') id: string, @Body() generateReportDto: GenerateReportDto, @AuthUser() user: any): Promise<Report> {
    // In a real application, you would fetch data based on the templateId and filters
    // For demonstration, we'll use mock data
    const mockData = this.getMockData(generateReportDto.templateId);
    const options: any = {
      title: `Report ${generateReportDto.templateId}`,
      columns: this.getColumnsForTemplate(generateReportDto.templateId),
      filters: generateReportDto.filters,
      ...generateReportDto.options,
    };

    return await this.reportService.generateReport(id, mockData, options, user.id);
  }

  @Get(':id/download')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Download generated report' })
  @ApiResponse({ status: 200, description: 'Report file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @Header('Content-Type', 'application/octet-stream')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { buffer, fileName, contentType } = await this.reportService.downloadReport(id);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  @Post('cleanup/expired')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Cleanup expired reports' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  async cleanupExpired(): Promise<{ message: string; deletedCount: number }> {
    const deletedCount = await this.reportService.cleanupExpiredReports();
    return {
      message: 'Expired reports cleaned up successfully',
      deletedCount,
    };
  }

  // Helper methods for demonstration
  private getMockData(templateId: string): any[] {
    // Return mock data based on template
    const templates = {
      'users-report': Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'manager' : 'user',
        status: i % 2 === 0 ? 'active' : 'inactive',
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      })),
      'sales-report': Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        product: `Product ${i + 1}`,
        quantity: Math.floor(Math.random() * 100) + 1,
        price: Math.floor(Math.random() * 1000) + 100,
        total: 0, // Will be calculated
        date: new Date(Date.now() - i * 86400000).toISOString(),
      })).map(item => ({ ...item, total: item.quantity * item.price })),
    };

    return templates[templateId] || [];
  }

  private getColumnsForTemplate(templateId: string): any[] {
    const columns = {
      'users-report': [
        { header: 'ID', key: 'id', width: 50 },
        { header: 'Name', key: 'name', width: 150 },
        { header: 'Email', key: 'email', width: 200 },
        { header: 'Role', key: 'role', width: 100 },
        { header: 'Status', key: 'status', width: 100 },
        { header: 'Created At', key: 'createdAt', width: 150 },
      ],
      'sales-report': [
        { header: 'ID', key: 'id', width: 50 },
        { header: 'Product', key: 'product', width: 200 },
        { header: 'Quantity', key: 'quantity', width: 80 },
        { header: 'Price', key: 'price', width: 100 },
        { header: 'Total', key: 'total', width: 100 },
        { header: 'Date', key: 'date', width: 120 },
      ],
    };

    return columns[templateId] || [];
  }
}
