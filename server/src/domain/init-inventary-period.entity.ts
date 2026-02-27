/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Area } from './area.entity';
import { Product } from './product.entity';
import { Period } from './period.entity';
import { Company } from './company.entity';

/**
 * A InitInventaryPeriod.
 */
@Entity('init_inventary_period')
export class InitInventaryPeriod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'decimal', name: 'count', precision: 10, scale: 2, default: 0 })
  count: number;

  @ManyToOne(type => Area)
  area?: Area;

  @ManyToOne(type => Product)
  product?: Product;

  @ManyToOne(type => Period)
  period?: Period;

  @ManyToOne(type => Company)
  company?: Company;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
