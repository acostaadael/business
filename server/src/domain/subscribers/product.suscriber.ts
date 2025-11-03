import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Product } from '../product.entity';

@Injectable()
@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  /**
   * Specify the entity this subscriber is for.
   */
  listenTo() {
    return Product;
  }

  /**
   * Triggered before an entity is inserted.
   */
  async beforeInsert(event: InsertEvent<Product>) {
    console.log('BEFORE ENTITY INSERTED:', event.entity);
    const queryRunner = event.manager.queryRunner;

    if (!event.entity.hasCode && queryRunner) {
      const result = await queryRunner.query(`SELECT nextval('product_id_seq')`);
      const nextValue = result[0]?.nextval;
      event.entity.code = (1000000000000 + nextValue).toString();
    }
  }
}
