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
import { InventoryMovementDTO } from '../../service/dto/inventory-movement.dto';
import { InventoryMovementService } from '../../service/inventory-movement.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { PeriodService } from '../../service/period.service';
import { CompanyService } from '../../service/company.service';
import { InventoryMovementQueryDTO } from '../../service/dto/inventory-movement.query.dto';

@Controller('api/inventory-movements')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('inventory-movements')
export class InventoryMovementController {
  logger = new Logger('InventoryMovementController');

  constructor(
    private readonly inventoryMovementService: InventoryMovementService,
    private readonly periodService: PeriodService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: InventoryMovementDTO,
  })
  async getAll(@Req() req: Request): Promise<InventoryMovementDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');

    const openPeriod = await this.periodService.findOpen();
    const currentCompany = await this.companyService.findActive();

    const entryQuery = new InventoryMovementQueryDTO();
    entryQuery.periodId = openPeriod.id;
    entryQuery.pageRequest = pageRequest;
    entryQuery.companyId = currentCompany.id;
    entryQuery.globalFilter = req.query.globalSearch ? req.query.globalSearch.toString() : null;

    const [results, count] = await this.inventoryMovementService.findAndCount(entryQuery);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: InventoryMovementDTO,
  })
  async getOne(@Param('id') id: number): Promise<InventoryMovementDTO> {
    return await this.inventoryMovementService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create inventoryMovement' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: InventoryMovementDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() inventoryMovementDTO: InventoryMovementDTO): Promise<InventoryMovementDTO> {
    const created = await this.inventoryMovementService.save(inventoryMovementDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'InventoryMovement', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update inventoryMovement' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InventoryMovementDTO,
  })
  async put(@Req() req: Request, @Body() inventoryMovementDTO: InventoryMovementDTO): Promise<InventoryMovementDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'InventoryMovement', inventoryMovementDTO.id);
    return await this.inventoryMovementService.update(inventoryMovementDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update inventoryMovement with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InventoryMovementDTO,
  })
  async putId(@Req() req: Request, @Body() inventoryMovementDTO: InventoryMovementDTO): Promise<InventoryMovementDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'InventoryMovement', inventoryMovementDTO.id);
    return await this.inventoryMovementService.update(inventoryMovementDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete inventoryMovement' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'InventoryMovement', id);
    return await this.inventoryMovementService.deleteById(id);
  }
}
