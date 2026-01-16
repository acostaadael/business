import { InventoryMovement } from '../../domain/inventory-movement.entity';
import { InventoryMovementDTO } from '../dto/inventory-movement.dto';

/**
 * A InventoryMovement mapper object.
 */
export class InventoryMovementMapper {
  static fromDTOtoEntity(entityDTO: InventoryMovementDTO): InventoryMovement {
    if (!entityDTO) {
      return;
    }
    const entity = new InventoryMovement();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: InventoryMovement): InventoryMovementDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new InventoryMovementDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
