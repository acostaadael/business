// reports/dto/create-report.dto.ts
import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ReportType, ReportFormat } from '../enums/report-type.enum';
import { Transform } from 'class-transformer';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : {}))
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : {}))
  parameters?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
