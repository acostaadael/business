/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { ProductFamily } from './product-family.entity';

/**
 * A ProductLine.
 */
@Entity('product_line')
export class ProductLine extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @ManyToOne(type => ProductFamily)
  productFamily?: ProductFamily;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
