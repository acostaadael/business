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
import { ProductFamilyDTO } from '../../service/dto/product-family.dto';
import { ProductFamilyService } from '../../service/product-family.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { ILike } from 'typeorm';

@Controller('api/product-families')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('product-families')
export class ProductFamilyController {
  logger = new Logger('ProductFamilyController');

  constructor(private readonly productFamilyService: ProductFamilyService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: ProductFamilyDTO,
  })
  async getAll(@Req() req: Request): Promise<ProductFamilyDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');

    const options = req.query.globalSearch
      ? {
          skip: +pageRequest.page * pageRequest.size,
          take: +pageRequest.size,
          where: [
            { name: ILike(`%${req.query.globalSearch}%`) },
            { description: ILike(`%${req.query.globalSearch}%`) },
            { productCategory: { name: ILike(`%${req.query.globalSearch}%`) } },
          ],
          order: pageRequest.sort.asOrder(),
        }
      : {
          skip: +pageRequest.page * pageRequest.size,
          take: +pageRequest.size,
          order: pageRequest.sort.asOrder(),
        };

    const [results, count] = await this.productFamilyService.findAndCount(options);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: ProductFamilyDTO,
  })
  async getOne(@Param('id') id: number): Promise<ProductFamilyDTO> {
    return await this.productFamilyService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create productFamily' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: ProductFamilyDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() productFamilyDTO: ProductFamilyDTO): Promise<ProductFamilyDTO> {
    const created = await this.productFamilyService.save(productFamilyDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductFamily', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productFamily' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductFamilyDTO,
  })
  async put(@Req() req: Request, @Body() productFamilyDTO: ProductFamilyDTO): Promise<ProductFamilyDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductFamily', productFamilyDTO.id);
    return await this.productFamilyService.update(productFamilyDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update productFamily with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: ProductFamilyDTO,
  })
  async putId(@Req() req: Request, @Body() productFamilyDTO: ProductFamilyDTO): Promise<ProductFamilyDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'ProductFamily', productFamilyDTO.id);
    return await this.productFamilyService.update(productFamilyDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete productFamily' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'ProductFamily', id);
    return await this.productFamilyService.deleteById(id);
  }
}
