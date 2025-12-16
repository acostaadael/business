/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { ProductDTO } from './product.dto';

/**
 * A InventaryDTO object.
 */
export class InventaryDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'count field' })
  count: number;

  @ApiProperty({ type: () => ProductDTO, description: 'product relationship' })
  product?: ProductDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
