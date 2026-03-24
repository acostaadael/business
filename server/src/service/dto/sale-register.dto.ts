/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { SaleDTO } from './sale.dto';
import { ProductShipmentDTO } from './product-shipment.dto';

/**
 * Payload para registrar una venta completa:
 * 1) crea productShipments (type=VENTA)
 * 2) crea Sale
 * 3) crea SaleProductShipment asociados
 */
export class SaleRegisterDTO {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SaleDTO)
  @ApiProperty({ type: () => SaleDTO })
  sale: SaleDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductShipmentDTO)
  @ApiProperty({ type: () => ProductShipmentDTO, isArray: true })
  shipments: ProductShipmentDTO[];
}
