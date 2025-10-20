/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { PeriodStatus } from './enumeration/period-status';

/**
 * A Period.
 */
@Entity('period')
export class Period extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'integer', name: 'month' })
  month: number;

  @Column({ type: 'integer', name: 'year' })
  year: number;

  @Column({ type: 'varchar', name: 'status', enum: PeriodStatus })
  status: PeriodStatus;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
