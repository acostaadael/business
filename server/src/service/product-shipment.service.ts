import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { ProductShipmentDTO } from '../service/dto/product-shipment.dto';
import { ProductShipmentMapper } from '../service/mapper/product-shipment.mapper';
import { PeriodService } from '../service/period.service';
import { CompanyService } from '../service/company.service';
import { InventaryService } from '../service/inventary.service';
import { InventoryMovementQueryDTO } from './dto/inventory-movement.query.dto';
import { ProductShipmentRepository } from '../repository/inventary.shipment.repository';
import { SalesDashboardDTO } from './dto/sales-dashboard.dto';
import { EntryRepository } from '../repository/entry.repository';
import { SalesDashboardFilterDTO } from './dto/sales-dashboard-filter.dto';
import { SaleRepository } from '../repository/sale.repository';
import { SaleType } from '../domain/enumeration/sale-type';

const relations = {
  product: true,
  company: true,
  period: true,
} as const;

@Injectable()
export class ProductShipmentService {
  logger = new Logger('ProductShipmentService');

  constructor(
    private readonly productShipmentRepository: ProductShipmentRepository,
    private periodService: PeriodService,
    private companyService: CompanyService,
    private inventaryService: InventaryService,
    private readonly entryRepository: EntryRepository,
    private readonly saleRepository: SaleRepository,
  ) {}

  async findById(id: number): Promise<ProductShipmentDTO | undefined> {
    const result = await this.productShipmentRepository.findOne({
      relations,
      where: { id },
    });
    return ProductShipmentMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<ProductShipmentDTO>): Promise<ProductShipmentDTO | undefined> {
    const result = await this.productShipmentRepository.findOne(options);
    return ProductShipmentMapper.fromEntityToDTO(result);
  }

  async findAndCount(query: InventoryMovementQueryDTO): Promise<[ProductShipmentDTO[], number]> {
    const resultList = await this.productShipmentRepository.findAllFilter(query);
    const productShipmentDTO: ProductShipmentDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(productShipment => productShipmentDTO.push(ProductShipmentMapper.fromEntityToDTO(productShipment)));
      resultList[0] = productShipmentDTO;
    }
    return resultList;
  }

  async save(productShipmentDTO: ProductShipmentDTO, creator?: string): Promise<ProductShipmentDTO | undefined> {
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (openPeriod && currentCompany) {
      productShipmentDTO.period = openPeriod;
      productShipmentDTO.company = currentCompany;
      const entity = ProductShipmentMapper.fromDTOtoEntity(productShipmentDTO);
      if (creator) {
        if (!entity.createdBy) {
          entity.createdBy = creator;
        }
        entity.lastModifiedBy = creator;
      }

      await this.inventaryService.updateInventaryFromExitProduct(productShipmentDTO);
      const result = await this.productShipmentRepository.save(entity);
      return ProductShipmentMapper.fromEntityToDTO(result);
    }
    throw new HttpException('No se puede crear salida sin un periodo abierto!', HttpStatus.BAD_REQUEST);
  }

  /**
   * Guarda múltiples salidas.
   * Se ejecuta en serie para mantener consistencia al actualizar inventario.
   *
   * Reglas:
   * - Antes de guardar, TODOS los ProductShipment deben tener inventario existente.
   * - La suma de counts por (product, area, company) debe ser <= inventary.count.
   * - Si alguno falla, no se guarda ninguno.
   */
  async saveMany(items: ProductShipmentDTO[], creator?: string): Promise<ProductShipmentDTO[]> {
    const list = items ?? [];
    if (!list.length) return [];

    // 1) Normalizar y validar datos mínimos
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (!openPeriod || !currentCompany) {
      throw new HttpException('No se puede crear salida sin un periodo abierto y una compañía activa!', HttpStatus.BAD_REQUEST);
    }

    // Agrupa cantidades por producto+área+compañía para validar stock agregado.
    type StockKey = string;
    const requiredByKey = new Map<
      StockKey,
      { productId: number; areaId: number; companyId: number; required: number; first: ProductShipmentDTO }
    >();

    for (const it of list) {
      const productId = it.product?.id;
      const areaId = it.area?.id;
      const companyId = (it.company?.id ?? currentCompany.id) as number;
      const count = Number(it.count ?? 0);

      if (!productId) throw new HttpException('Cada salida debe tener product.id', HttpStatus.BAD_REQUEST);
      if (!areaId) throw new HttpException('Cada salida debe tener area.id', HttpStatus.BAD_REQUEST);
      if (!Number.isFinite(count) || count <= 0) {
        throw new HttpException(`Cantidad inválida para el producto ${it.product?.name ?? productId}`, HttpStatus.BAD_REQUEST);
      }

      const key = `${companyId}:${areaId}:${productId}`;
      const prev = requiredByKey.get(key);
      if (prev) {
        prev.required += count;
      } else {
        requiredByKey.set(key, { productId, areaId, companyId, required: count, first: it });
      }
    }

    // 2) Validar contra inventario TODO antes de guardar
    for (const req of requiredByKey.values()) {
      const inv = await this.inventaryService.findByFields({
        relations: { product: true, area: true, company: true },
        where: {
          product: { id: req.productId },
          area: { id: req.areaId },
          company: { id: req.companyId },
        },
      });

      if (!inv) {
        throw new HttpException(
          `No existe inventario para el producto ${req.first.product?.name ?? req.productId} en el área seleccionada.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const inventoryCount = Number(inv.count ?? 0);
      if (req.required > inventoryCount) {
        const umName = req.first.product?.um?.name ? ` ${req.first.product.um.name}` : '';
        throw new HttpException(
          `La cantidad a despachar supera lo que está en inventario (Producto: ${req.first.product?.name ?? req.productId}, ` +
            `Requerido: ${req.required}${umName}, Existencia: ${inventoryCount}${umName}).`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // 3) Si todo está OK, guardar en serie (cada save actualiza inventario)
    const productShipmentDTOS: ProductShipmentDTO[] = [];
    for (const item of list) {
      // asegurar periodo/compañía actuales (no confiar en el cliente)
      item.period = openPeriod;
      item.company = currentCompany;

      const created = await this.save(item, creator);
      if (created) productShipmentDTOS.push(created);
    }
    return productShipmentDTOS;
  }

  async update(productShipmentDTO: ProductShipmentDTO, updater?: string): Promise<ProductShipmentDTO | undefined> {
    const entity = ProductShipmentMapper.fromDTOtoEntity(productShipmentDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.productShipmentRepository.save(entity);
    return ProductShipmentMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.productShipmentRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
  }

  async getSalesDashboard(filter?: SalesDashboardFilterDTO): Promise<SalesDashboardDTO> {
    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    if (!openPeriod || !currentCompany) {
      throw new HttpException('No existe un periodo abierto o una compañía activa para calcular el dashboard.', HttpStatus.BAD_REQUEST);
    }

    const productCategoryId = filter?.productCategoryId;
    const productFamilyId = filter?.productFamilyId;
    const productLineId = filter?.productLineId;

    const [totalSalesAmount, cashSalesAmount, transferSalesAmount, totalCostAmount, salesByDay, topProducts] = await Promise.all([
      this.saleRepository.sumSalesAmountFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.saleRepository.sumSalesAmountByTypeFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        type: SaleType.EFECTIVO,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.saleRepository.sumSalesAmountByTypeFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        type: SaleType.TRANSFERENCIA,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.entryRepository.sumCostAmountByPeriodCompanyFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.saleRepository.sumSalesByDayFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.saleRepository.topProductsByAmountFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        limit: 8,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
    ]);

    // Cantidad total se deja en 0 por ahora (no se usa en UI)
    const totalSalesCount = 0;

    const totalProfitAmount = (totalSalesAmount ?? 0) - (totalCostAmount ?? 0);

    return {
      year: openPeriod.year,
      month: openPeriod.month,
      totalSalesCount,
      totalSalesAmount,
      cashSalesAmount,
      transferSalesAmount,
      totalCostAmount,
      totalProfitAmount,
      salesByDay: (salesByDay as any) ?? [],
      topProducts: (topProducts as any) ?? [],
    };
  }
}
