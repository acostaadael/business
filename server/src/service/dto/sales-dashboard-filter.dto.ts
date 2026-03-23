import { ApiPropertyOptional } from '@nestjs/swagger';

export class SalesDashboardFilterDTO {
  @ApiPropertyOptional({ example: 1, description: 'Filtra por categoría de producto' })
  productCategoryId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filtra por familia de producto' })
  productFamilyId?: number;

  @ApiPropertyOptional({ example: 3, description: 'Filtra por línea de producto' })
  productLineId?: number;
}
