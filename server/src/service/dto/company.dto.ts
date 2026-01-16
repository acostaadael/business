/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

/**
 * A CompanyDTO object.
 */
export class CompanyDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'name field' })
  name: string;

  @ApiProperty({ description: 'active field', required: false })
  active?: boolean;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
