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
import { ProductLineDTO } from '../../service/dto/product-line.dto';
import { ProductLineService } from '../../service/product-line.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/product-lines')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('product-lines')
export class ProductLineController {
  logger = new Logger('ProductLineController');

  constructor(private readonly productLineService: ProductLineService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: ProductLineDTO,
  })
  async getAll(@Req() req: Request): Promise<ProductLineDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.productLineService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: ProductLineDTO,
  })
  async getOne(@Param('id') id: number): Promise<ProductLineDTO> {
    return await this.productLineService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create productLine' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: ProductLineDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() productLineDTO: ProductLineDTO): Promise<ProductLineDTO> {
    const created = await this.productLineService.save(productLineDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductLine', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productLine' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductLineDTO,
  })
  async put(@Req() req: Request, @Body() productLineDTO: ProductLineDTO): Promise<ProductLineDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductLine', productLineDTO.id);
    return await this.productLineService.update(productLineDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productLine with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductLineDTO,
  })
  async putId(@Req() req: Request, @Body() productLineDTO: ProductLineDTO): Promise<ProductLineDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductLine', productLineDTO.id);
    return await this.productLineService.update(productLineDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete productLine' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'ProductLine', id);
    return await this.productLineService.deleteById(id);
  }
}
