/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { Sale } from './sale.entity';
import { ProductShipment } from './product-shipment.entity';

/**
 * A SaleProductShipment.
 *
 * Entidad intermedia para la relación (potencialmente many-to-many) entre Sale y ProductShipment.
 */
@Entity('sale_product_shipment')
export class SaleProductShipment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Sale, sale => sale.productShipments)
  sale?: Sale;

  @ManyToOne(() => ProductShipment)
  productShipment?: ProductShipment;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
