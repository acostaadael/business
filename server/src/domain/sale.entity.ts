/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Period } from './period.entity';
import { Company } from './company.entity';
import { Area } from './area.entity';
import { SaleType } from './enumeration/sale-type';
import { SaleProductShipment } from './sale-product-shipment.entity';

/**
 * A Sale.
 */
@Entity('sale')
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'integer', name: 'day' })
  day: number;

  @Column({ type: 'varchar', name: 'type', enum: SaleType })
  type: SaleType;

  @Column({ type: 'varchar', name: 'transfer_number', nullable: true })
  transferNumber?: string;

  @ManyToOne(type => Period)
  period?: Period;

  @ManyToOne(type => Company)
  company?: Company;

  @ManyToOne(type => Area)
  area?: Area;

  @OneToMany(() => SaleProductShipment, sps => sps.sale)
  productShipments?: SaleProductShipment[];

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
