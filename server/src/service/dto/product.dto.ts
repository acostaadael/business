/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { UmDTO } from './um.dto';
import { ProductLineDTO } from './product-line.dto';

/**
 * A ProductDTO object.
 */
export class ProductDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'code field' })
  code: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'name field' })
  name: string;

  @ApiProperty({ description: 'description field', required: false })
  description?: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'costPrice field' })
  costPrice: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'profitMargin field' })
  profitMargin: number;

  @ApiProperty({ description: 'hasCode field', required: false })
  hasCode?: boolean;

  @ApiProperty({ type: () => UmDTO, description: 'um relationship' })
  um?: UmDTO;
  @ApiProperty({ type: () => ProductLineDTO, description: 'productLine relationship' })
  productLine?: ProductLineDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
