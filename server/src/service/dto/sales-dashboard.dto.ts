import { ApiProperty } from '@nestjs/swagger';

export class SalesByDayDTO {
  @ApiProperty({ example: 1 })
  day: number;

  @ApiProperty({ example: 120, description: 'Cantidad total vendida (suma de count)' })
  total: number;

  @ApiProperty({ example: 3450.75, description: 'Importe total del día (SUM(count * sellingPrice))' })
  amount: number;
}

export class TopProductSalesDTO {
  @ApiProperty({ example: 10 })
  productId: number;

  @ApiProperty({ example: 'Producto A' })
  productName: string;

  @ApiProperty({ example: 350 })
  total: number;

  @ApiProperty({ example: 'kg', description: 'Unidad de medida del producto' })
  umName: string;

  @ApiProperty({ example: 12500.5, description: 'Importe total vendido del producto (count * sellingPrice)' })
  amount: number;
}

export class SalesDashboardDTO {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 3 })
  month: number;

  @ApiProperty({ example: 1200 })
  totalSalesCount: number;

  @ApiProperty({ example: 45678.9, description: 'Importe total vendido del periodo (count * sellingPrice)' })
  totalSalesAmount: number;

  @ApiProperty({ example: 32100.45, description: 'Costo total de compras del periodo (SUM(entry.count * costPrice))' })
  totalCostAmount: number;

  @ApiProperty({ example: 13578.45, description: 'Ganancia estimada del periodo (totalSalesAmount - totalCostAmount)' })
  totalProfitAmount: number;

  @ApiProperty({ type: () => [SalesByDayDTO] })
  salesByDay: SalesByDayDTO[];

  @ApiProperty({ type: () => [TopProductSalesDTO] })
  topProducts: TopProductSalesDTO[];
}
