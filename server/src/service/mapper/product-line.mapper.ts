import { ProductLine } from '../../domain/product-line.entity';
import { ProductLineDTO } from '../dto/product-line.dto';

/**
 * A ProductLine mapper object.
 */
export class ProductLineMapper {
  static fromDTOtoEntity(entityDTO: ProductLineDTO): ProductLine {
    if (!entityDTO) {
      return;
    }
    const entity = new ProductLine();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: ProductLine): ProductLineDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ProductLineDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
