/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Product } from './product.entity';

/**
 * A Inventary.
 */
@Entity('inventary')
export class Inventary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'decimal', name: 'count', precision: 10, scale: 2, default: 0 })
  count: number;

  @ManyToOne(type => Product)
  product?: Product;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
