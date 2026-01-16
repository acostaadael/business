/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { PeriodDTO } from './period.dto';
import { CompanyDTO } from './company.dto';
import { ProductDTO } from './product.dto';
import { AreaDTO } from './area.dto';

/**
 * A InventoryMovementDTO object.
 */
export class InventoryMovementDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'day field' })
  day: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'count field' })
  count: number;

  @ApiProperty({ type: () => PeriodDTO, description: 'period relationship' })
  period?: PeriodDTO;
  @ApiProperty({ type: () => CompanyDTO, description: 'company relationship' })
  company?: CompanyDTO;
  @ApiProperty({ type: () => ProductDTO, description: 'product relationship' })
  product?: ProductDTO;
  @ApiProperty({ type: () => AreaDTO, description: 'source relationship' })
  source?: AreaDTO;
  @ApiProperty({ type: () => AreaDTO, description: 'target relationship' })
  target?: AreaDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
