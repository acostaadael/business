/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Product } from './product.entity';
import { Company } from './company.entity';
import { ExitType } from './enumeration/exit-type';
import { Period } from './period.entity';
import { Area } from './area.entity';

/**
 * A ProductShipment.
 */
@Entity('product_shipment')
export class ProductShipment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'integer', name: 'day' })
  day: number;

  @Column({ type: 'decimal', name: 'count', precision: 10, scale: 2 })
  count: number;

  @Column({ type: 'varchar', name: 'type', enum: ExitType })
  type: ExitType;

  @ManyToOne(type => Product)
  product?: Product;

  @ManyToOne(type => Company)
  company?: Company;

  @ManyToOne(type => Period)
  period?: Period;

  @ManyToOne(type => Area)
  area?: Area;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
