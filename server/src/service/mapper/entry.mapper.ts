import { Entry } from '../../domain/entry.entity';
import { EntryDTO } from '../dto/entry.dto';

/**
 * A Entry mapper object.
 */
export class EntryMapper {
  static fromDTOtoEntity(entityDTO: EntryDTO): Entry {
    if (!entityDTO) {
      return;
    }
    const entity = new Entry();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Entry): EntryDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new EntryDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
