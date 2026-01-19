/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ExitType } from '../../domain/enumeration/exit-type';
import { BaseDTO } from './base.dto';

import { ProductDTO } from './product.dto';
import { CompanyDTO } from './company.dto';
import { PeriodDTO } from './period.dto';
import { AreaDTO } from './area.dto';

/**
 * A ProductShipmentDTO object.
 */
export class ProductShipmentDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'day field' })
  day: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'count field' })
  count: number;

  @IsNotEmpty()
  @ApiProperty({ enum: ExitType, description: 'type enum field' })
  type: ExitType;

  @ApiProperty({ type: () => ProductDTO, description: 'product relationship' })
  product?: ProductDTO;
  @ApiProperty({ type: () => CompanyDTO, description: 'company relationship' })
  company?: CompanyDTO;
  @ApiProperty({ type: () => PeriodDTO, description: 'period relationship' })
  period?: PeriodDTO;
  @ApiProperty({ type: () => AreaDTO, description: 'area relationship' })
  area?: AreaDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
