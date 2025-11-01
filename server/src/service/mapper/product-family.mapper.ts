import { ProductFamily } from '../../domain/product-family.entity';
import { ProductFamilyDTO } from '../dto/product-family.dto';

/**
 * A ProductFamily mapper object.
 */
export class ProductFamilyMapper {
  static fromDTOtoEntity(entityDTO: ProductFamilyDTO): ProductFamily {
    if (!entityDTO) {
      return;
    }
    const entity = new ProductFamily();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: ProductFamily): ProductFamilyDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ProductFamilyDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
