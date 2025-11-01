import { ProductCategory } from '../../domain/product-category.entity';
import { ProductCategoryDTO } from '../dto/product-category.dto';

/**
 * A ProductCategory mapper object.
 */
export class ProductCategoryMapper {
  static fromDTOtoEntity(entityDTO: ProductCategoryDTO): ProductCategory {
    if (!entityDTO) {
      return;
    }
    const entity = new ProductCategory();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: ProductCategory): ProductCategoryDTO {
    if (!entity) {
      return;
    }
    const entityDTO = new ProductCategoryDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
