/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Period } from './period.entity';
import { Company } from './company.entity';
import { Product } from './product.entity';
import { Area } from './area.entity';

/**
 * A InventoryMovement.
 */
@Entity('inventory_movement')
export class InventoryMovement extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'integer', name: 'day' })
  day: number;

  @Column({ type: 'decimal', name: 'count', precision: 10, scale: 2 })
  count: number;

  @ManyToOne(type => Period)
  period?: Period;

  @ManyToOne(type => Company)
  company?: Company;

  @ManyToOne(type => Product)
  product?: Product;

  @ManyToOne(type => Area)
  source?: Area;

  @ManyToOne(type => Area)
  target?: Area;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
