/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { ProductCategoryDTO } from './product-category.dto';

/**
 * A ProductFamilyDTO object.
 */
export class ProductFamilyDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'name field' })
  name: string;

  @ApiProperty({ description: 'description field', required: false })
  description?: string;

  @ApiProperty({ type: () => ProductCategoryDTO, description: 'productCategory relationship' })
  productCategory?: ProductCategoryDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
