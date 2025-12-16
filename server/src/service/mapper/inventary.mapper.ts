import { Inventary } from '../../domain/inventary.entity';
import { InventaryDTO } from '../dto/inventary.dto';

/**
 * A Inventary mapper object.
 */
export class InventaryMapper {
  static fromDTOtoEntity(entityDTO: InventaryDTO): Inventary {
    if (!entityDTO) {
      return;
    }
    const entity = new Inventary();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Inventary): InventaryDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new InventaryDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
