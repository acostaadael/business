/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

import { ProductDTO } from './product.dto';
import { AreaDTO } from './area.dto';
import { CompanyDTO } from './company.dto';

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

  @ApiProperty({ type: () => AreaDTO, description: 'area relationship' })
  area?: AreaDTO;

  @ApiProperty({ type: () => CompanyDTO, description: 'company relationship' })
  company?: CompanyDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
