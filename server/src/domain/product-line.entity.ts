/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { ProductFamily } from './product-family.entity';
import { Product } from './product.entity';

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

  @OneToMany(type => Product, other => other.productLine)
  products?: Product[];

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
