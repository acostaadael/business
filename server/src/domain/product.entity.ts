/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Um } from './um.entity';
import { ProductLine } from './product-line.entity';

/**
 * A Product.
 */
@Entity('product')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'code', unique: true })
  code: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'decimal', name: 'cost_price', precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column({ type: 'decimal', name: 'profit_margin', precision: 10, scale: 2, default: 0 })
  profitMargin: number;

  @Column({ type: 'boolean', name: 'has_code', nullable: true })
  hasCode?: boolean;

  @ManyToOne(type => Um)
  um?: Um;

  @ManyToOne(type => ProductLine)
  productLine?: ProductLine;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
