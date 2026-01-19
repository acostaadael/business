import { ProductShipment } from '../../domain/product-shipment.entity';
import { ProductShipmentDTO } from '../dto/product-shipment.dto';

/**
 * A ProductShipment mapper object.
 */
export class ProductShipmentMapper {
  static fromDTOtoEntity(entityDTO: ProductShipmentDTO): ProductShipment {
    if (!entityDTO) {
      return;
    }
    const entity = new ProductShipment();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: ProductShipment): ProductShipmentDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ProductShipmentDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
