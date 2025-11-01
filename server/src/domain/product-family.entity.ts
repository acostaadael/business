/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { ProductCategory } from './product-category.entity';

/**
 * A ProductFamily.
 */
@Entity('product_family')
export class ProductFamily extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @ManyToOne(type => ProductCategory)
  productCategory?: ProductCategory;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
