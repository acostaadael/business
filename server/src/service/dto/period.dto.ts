/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PeriodStatus } from '../../domain/enumeration/period-status';
import { BaseDTO } from './base.dto';

/**
 * A PeriodDTO object.
 */
export class PeriodDTO extends BaseDTO {
  id?: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'month field' })
  month: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'year field' })
  year: number;

  @IsNotEmpty()
  @ApiProperty({ enum: PeriodStatus, description: 'status enum field' })
  status: PeriodStatus;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
