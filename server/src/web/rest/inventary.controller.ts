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
import { InventaryDTO } from '../../service/dto/inventary.dto';
import { InventaryService } from '../../service/inventary.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { CompanyService } from '../../service/company.service';
import { InventaryQueryDTO } from '../../service/dto/inventary.query.dto';

@Controller('api/inventaries')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('inventaries')
export class InventaryController {
  logger = new Logger('InventaryController');

  constructor(
    private readonly inventaryService: InventaryService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: InventaryDTO,
  })
  async getAll(@Req() req: Request): Promise<InventaryDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');

    const currentCompany = await this.companyService.findActive();

    const inventaryQuery = new InventaryQueryDTO();
    inventaryQuery.pageRequest = pageRequest;
    inventaryQuery.companyId = currentCompany.id;
    inventaryQuery.globalFilter = req.query.globalSearch ? req.query.globalSearch.toString() : null;

    const [results, count] = await this.inventaryService.findAndCount(inventaryQuery);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: InventaryDTO,
  })
  async getOne(@Param('id') id: number): Promise<InventaryDTO> {
    return await this.inventaryService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create inventary' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: InventaryDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() inventaryDTO: InventaryDTO): Promise<InventaryDTO> {
    const created = await this.inventaryService.save(inventaryDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Inventary', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update inventary' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InventaryDTO,
  })
  async put(@Req() req: Request, @Body() inventaryDTO: InventaryDTO): Promise<InventaryDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Inventary', inventaryDTO.id);
    return await this.inventaryService.update(inventaryDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update inventary with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: InventaryDTO,
  })
  async putId(@Req() req: Request, @Body() inventaryDTO: InventaryDTO): Promise<InventaryDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Inventary', inventaryDTO.id);
    return await this.inventaryService.update(inventaryDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete inventary' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Inventary', id);
    return await this.inventaryService.deleteById(id);
  }
}
