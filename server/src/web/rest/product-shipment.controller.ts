import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post as PostMethod,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductShipmentDTO } from '../../service/dto/product-shipment.dto';
import { ProductShipmentService } from '../../service/product-shipment.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { PeriodService } from '../../service/period.service';
import { CompanyService } from '../../service/company.service';
import { InventoryMovementQueryDTO } from '../../service/dto/inventory-movement.query.dto';

@Controller('api/product-shipments')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('product-shipments')
export class ProductShipmentController {
  logger = new Logger('ProductShipmentController');

  constructor(
    private readonly productShipmentService: ProductShipmentService,
    private readonly periodService: PeriodService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: ProductShipmentDTO,
  })
  async getAll(@Req() req: Request): Promise<ProductShipmentDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');

    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    const entryQuery = new InventoryMovementQueryDTO();
    entryQuery.periodId = openPeriod.id;
    entryQuery.pageRequest = pageRequest;
    entryQuery.companyId = currentCompany.id;
    entryQuery.exitType = req.query.exitType ? req.query.exitType.toString() : null;
    entryQuery.globalFilter = req.query.globalSearch ? req.query.globalSearch.toString() : null;

    const [results, count] = await this.productShipmentService.findAndCount(entryQuery);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: ProductShipmentDTO,
  })
  async getOne(@Param('id') id: number): Promise<ProductShipmentDTO> {
    return await this.productShipmentService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create productShipment' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: ProductShipmentDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() productShipmentDTO: ProductShipmentDTO): Promise<ProductShipmentDTO> {
    const created = await this.productShipmentService.save(productShipmentDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductShipment', created.id);
    return created;
  }

  @PostMethod('/batch')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create many exits' })
  @ApiResponse({
    status: 201,
    description: 'The records have been successfully created.',
    type: ProductShipmentDTO,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async postMany(@Req() req: Request, @Body() productShipmentDTOS: ProductShipmentDTO[]): Promise<ProductShipmentDTO[]> {
    const created = await this.productShipmentService.saveMany(productShipmentDTOS, req.user?.login);

    const ids = created
      .map(it => it?.id)
      .filter((id): id is number => typeof id === 'number')
      .join(',');

    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductShipment', ids);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productShipment' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductShipmentDTO,
  })
  async put(@Req() req: Request, @Body() productShipmentDTO: ProductShipmentDTO): Promise<ProductShipmentDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductShipment', productShipmentDTO.id);
    return await this.productShipmentService.update(productShipmentDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productShipment with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductShipmentDTO,
  })
  async putId(@Req() req: Request, @Body() productShipmentDTO: ProductShipmentDTO): Promise<ProductShipmentDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductShipment', productShipmentDTO.id);
    return await this.productShipmentService.update(productShipmentDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete productShipment' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'ProductShipment', id);
    return await this.productShipmentService.deleteById(id);
  }
}
