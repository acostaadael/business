import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { ProductShipmentDTO } from '../service/dto/product-shipment.dto';
import { ProductShipmentMapper } from '../service/mapper/product-shipment.mapper';
import { PeriodService } from '../service/period.service';
import { CompanyService } from '../service/company.service';
import { InventaryService } from '../service/inventary.service';
import { InventoryMovementQueryDTO } from './dto/inventory-movement.query.dto';
import { ProductShipmentRepository } from '../repository/inventary.shipment.repository';
import { ExitType } from '../domain/enumeration/exit-type';
import { SalesDashboardDTO } from './dto/sales-dashboard.dto';
import { EntryRepository } from '../repository/entry.repository';
import { SalesDashboardFilterDTO } from './dto/sales-dashboard-filter.dto';

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
   */
  async saveMany(items: ProductShipmentDTO[], creator?: string): Promise<ProductShipmentDTO[]> {
    const productShipmentDTOS: ProductShipmentDTO[] = [];
    for (const item of items ?? []) {
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

    const type = ExitType.VENTA;

    const productCategoryId = filter?.productCategoryId;
    const productFamilyId = filter?.productFamilyId;
    const productLineId = filter?.productLineId;

    const [totalSalesAmount, totalCostAmount, salesByDay, topProducts] = await Promise.all([
      this.productShipmentRepository.sumAmountByPeriodCompanyTypeFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        type,
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
      this.productShipmentRepository.sumCountAndAmountByDayFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        type,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
      this.productShipmentRepository.topProductsByCountAndAmountFiltered({
        companyId: currentCompany.id,
        periodId: openPeriod.id,
        type,
        limit: 8,
        productCategoryId,
        productFamilyId,
        productLineId,
      }),
    ]);

    // Cantidad total se deja calculada por sumCount si lo necesitan, pero como lo quitamos del UI evitamos costo extra.
    const totalSalesCount = 0;

    const totalProfitAmount = (totalSalesAmount ?? 0) - (totalCostAmount ?? 0);

    return {
      year: openPeriod.year,
      month: openPeriod.month,
      totalSalesCount,
      totalSalesAmount,
      totalCostAmount,
      totalProfitAmount,
      salesByDay,
      topProducts,
    };
  }
}
