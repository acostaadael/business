import { Um } from '../../domain/um.entity';
import { UmDTO } from '../dto/um.dto';

/**
 * A Um mapper object.
 */
export class UmMapper {
  static fromDTOtoEntity(entityDTO: UmDTO): Um {
    if (!entityDTO) {
      return;
    }
    const entity = new Um();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Um): UmDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new UmDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
