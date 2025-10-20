import { Period } from '../../domain/period.entity';
import { PeriodDTO } from '../dto/period.dto';

/**
 * A Period mapper object.
 */
export class PeriodMapper {
  static fromDTOtoEntity(entityDTO: PeriodDTO): Period {
    if (!entityDTO) {
      return;
    }
    const entity = new Period();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Period): PeriodDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new PeriodDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
