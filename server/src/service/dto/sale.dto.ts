/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { BaseDTO } from './base.dto';

import { PeriodDTO } from './period.dto';
import { CompanyDTO } from './company.dto';
import { AreaDTO } from './area.dto';
import { SaleType } from '../../domain/enumeration/sale-type';

/**
 * A SaleDTO object.
 */
export class SaleDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'day field' })
  day: number;

  @IsNotEmpty()
  @ApiProperty({ enum: SaleType, description: 'type enum field' })
  type: SaleType;

  @ValidateIf(o => o.type === SaleType.TRANSFERENCIA)
  @ApiProperty({ description: 'transferNumber field', required: false })
  transferNumber?: string;

  @ApiProperty({ type: () => PeriodDTO, description: 'period relationship' })
  period?: PeriodDTO;

  @ApiProperty({ type: () => CompanyDTO, description: 'company relationship' })
  company?: CompanyDTO;

  @ApiProperty({ type: () => AreaDTO, description: 'area relationship' })
  area?: AreaDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
