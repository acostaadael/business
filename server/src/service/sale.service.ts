import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Sale } from '../domain/sale.entity';
import { SaleProductShipment } from '../domain/sale-product-shipment.entity';
import { ExitType } from '../domain/enumeration/exit-type';

import { PeriodService } from './period.service';
import { CompanyService } from './company.service';
import { ProductShipmentService } from './product-shipment.service';

import { SaleRegisterDTO } from './dto/sale-register.dto';
import { SaleRegisterResultDTO } from './dto/sale-register-result.dto';
import { SaleMapper } from './mapper/sale.mapper';

@Injectable()
export class SaleService {
  logger = new Logger('SaleService');

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleProductShipment) private readonly saleProductShipmentRepository: Repository<SaleProductShipment>,
    private readonly periodService: PeriodService,
    private readonly companyService: CompanyService,
    private readonly productShipmentService: ProductShipmentService,
  ) {}

  /**
   * Registra una venta completa:
   * 1) crea los ProductShipments con type=VENTA (y actualiza inventario)
   * 2) crea Sale
   * 3) guarda los vínculos en SaleProductShipment
   */
  async register(payload: SaleRegisterDTO, creator?: string): Promise<SaleRegisterResultDTO> {
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (!openPeriod || !currentCompany) {
      throw new HttpException('No existe un periodo abierto o una compañía activa para registrar la venta.', HttpStatus.BAD_REQUEST);
    }

    if (!payload?.sale) {
      throw new HttpException('sale es requerido', HttpStatus.BAD_REQUEST);
    }

    const shipmentsInput = payload.shipments ?? [];
    if (!shipmentsInput.length) {
      throw new HttpException('shipments es requerido y no puede estar vacío', HttpStatus.BAD_REQUEST);
    }

    // Fuerza periodo/compañía y tipo venta.
    const normalizedShipments = shipmentsInput.map(s => ({
      ...s,
      type: ExitType.VENTA,
      period: openPeriod,
      company: currentCompany,
    }));

    // Usamos transacción para que sea atómico.
    return await this.dataSource.transaction(async () => {
      // 1) Crear los productShipments (en serie para consistencia de inventario)
      const createdShipments = await this.productShipmentService.saveMany(normalizedShipments as any, creator);

      // 2) Crear Sale
      const saleDTO = {
        ...payload.sale,
        period: openPeriod,
        company: currentCompany,
      };

      const saleEntity = SaleMapper.fromDTOtoEntity(saleDTO as any);
      if (creator) {
        if (!saleEntity.createdBy) saleEntity.createdBy = creator;
        saleEntity.lastModifiedBy = creator;
      }

      const createdSale = await this.saleRepository.save(saleEntity);

      // 3) Crear vínculos SaleProductShipment
      const links = createdShipments.map(psDTO => {
        const link = new SaleProductShipment();
        link.sale = createdSale;
        link.productShipment = { id: psDTO.id } as any;
        if (creator) {
          if (!link.createdBy) link.createdBy = creator;
          link.lastModifiedBy = creator;
        }
        return link;
      });
      await this.saleProductShipmentRepository.save(links);

      return {
        sale: SaleMapper.fromEntityToDTO(createdSale) as any,
        shipments: createdShipments,
      };
    });
  }
}
