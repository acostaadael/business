/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { ProductFamilyDTO } from './product-family.dto';
import { ProductDTO } from './product.dto';

/**
 * A ProductLineDTO object.
 */
export class ProductLineDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'name field' })
  name: string;

  @ApiProperty({ description: 'description field', required: false })
  description?: string;

  @ApiProperty({ type: () => ProductFamilyDTO, description: 'productFamily relationship' })
  productFamily?: ProductFamilyDTO;

  @ApiProperty({ type: () => ProductDTO, isArray: true, description: 'products relationship' })
  products?: ProductDTO[];

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
