/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { AreaDTO } from './area.dto';
import { ProductDTO } from './product.dto';
import { PeriodDTO } from './period.dto';

/**
 * A EntryDTO object.
 */
export class EntryDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'day field' })
  day: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'count field' })
  count: number;

  @ApiProperty({ type: () => AreaDTO, description: 'area relationship' })
  area?: AreaDTO;

  @ApiProperty({ type: () => ProductDTO, description: 'product relationship' })
  product?: ProductDTO;

  @ApiProperty({ type: () => PeriodDTO, description: 'period relationship' })
  period?: PeriodDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
