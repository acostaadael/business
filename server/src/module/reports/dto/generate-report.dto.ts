// reports/dto/generate-report.dto.ts
import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
import { ReportFormat } from '../enums/report-type.enum';
import { Transform } from 'class-transformer';

export class GenerateReportDto {
  @IsString()
  templateId: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : {}))
  data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : {}))
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : {}))
  options?: Record<string, any>;
}
