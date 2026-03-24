/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { SaleDTO } from './sale.dto';
import { ProductShipmentDTO } from './product-shipment.dto';

export class SaleRegisterResultDTO {
  @ApiProperty({ type: () => SaleDTO })
  sale: SaleDTO;

  @ApiProperty({ type: () => ProductShipmentDTO, isArray: true })
  shipments: ProductShipmentDTO[];
}
