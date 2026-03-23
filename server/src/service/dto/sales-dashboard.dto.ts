import { ApiProperty } from '@nestjs/swagger';

export class SalesByDayDTO {
  @ApiProperty({ example: 1 })
  day: number;

  @ApiProperty({ example: 120 })
  total: number;
}

export class TopProductSalesDTO {
  @ApiProperty({ example: 10 })
  productId: number;

  @ApiProperty({ example: 'Producto A' })
  productName: string;

  @ApiProperty({ example: 350 })
  total: number;
}

export class SalesDashboardDTO {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 3 })
  month: number;

  @ApiProperty({ example: 1200 })
  totalSalesCount: number;

  @ApiProperty({ type: () => [SalesByDayDTO] })
  salesByDay: SalesByDayDTO[];

  @ApiProperty({ type: () => [TopProductSalesDTO] })
  topProducts: TopProductSalesDTO[];
}
