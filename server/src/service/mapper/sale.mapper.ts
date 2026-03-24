import { Sale } from '../../domain/sale.entity';
import { SaleDTO } from '../dto/sale.dto';

/**
 * A Sale mapper object.
 */
export class SaleMapper {
  static fromDTOtoEntity(entityDTO: SaleDTO): Sale {
    if (!entityDTO) {
      return;
    }
    const entity = new Sale();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Sale): SaleDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new SaleDTO();
    const fields = Object.getOwnPropertyNames(entity);
    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });
    return entityDTO;
  }
}
