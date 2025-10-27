/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from './base.dto';

/**
 * A AreaDTO object.
 */
export class AreaDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'name field' })
  name: string;

  @ApiProperty({ description: 'description field', required: false })
  description?: string;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
